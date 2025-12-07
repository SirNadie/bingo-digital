from fastapi import APIRouter, Depends, Header, HTTPException, BackgroundTasks
from typing import Optional, List, Tuple
from uuid import UUID

from sqlmodel import select, Session

from app.schemas import Game as GameSchema, GameCreate, GameState, DrawResponse, WinnerOut
from app.models.game import Game as GameModel
from app.core.database import get_session
from app.core.security import get_user_id_from_bearer
from app.core.websocket import manager
from app.models.user import User
from app.models.ticket import Ticket as TicketModel
from app.models.wallet import Wallet
from app.models.transaction import Transaction
import json
import random
import asyncio
from datetime import datetime


router = APIRouter(prefix="/games", tags=["games"])


def auth(bearer: Optional[str] = Header(None, alias="Authorization")) -> str:
    user_id = get_user_id_from_bearer(bearer)
    if not user_id:
        raise HTTPException(status_code=401, detail="No autorizado")
    return user_id


def _to_schema(m: GameModel) -> GameSchema:
    return GameSchema(
        id=UUID(m.id),
        creator_id=m.creator_id,
        price=m.price,
        min_tickets=m.min_tickets,
        status=m.status,
        sold_tickets=m.sold_tickets,
    )


def _broadcast_sync(game_id: str, event_type: str, data: dict):
    """Run async broadcast in sync context."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(manager.broadcast_to_game(game_id, event_type, data))
        else:
            loop.run_until_complete(manager.broadcast_to_game(game_id, event_type, data))
    except RuntimeError:
        # No event loop available
        asyncio.run(manager.broadcast_to_game(game_id, event_type, data))


@router.get("", response_model=dict)
def list_games(status: Optional[str] = None, session: Session = Depends(get_session)):
    stmt = select(GameModel)
    if status:
        stmt = stmt.where(GameModel.status == status)
    items = session.exec(stmt).all()
    return {"items": [_to_schema(g) for g in items]}


@router.get("/my-active", response_model=dict)
def list_my_active_games(user_id: str = Depends(auth), session: Session = Depends(get_session)):
    """Get games where the user has purchased tickets and the game is still active."""
    # Find tickets belonging to the user
    user_tickets = session.exec(
        select(TicketModel).where(TicketModel.user_id == user_id)
    ).all()
    
    # Get unique game IDs
    game_ids = set(t.game_id for t in user_tickets)
    
    # Get games that are active (not cancelled/finished)
    active_games = []
    for gid in game_ids:
        game = session.get(GameModel, gid)
        if game and game.status in ("OPEN", "RUNNING"):
            active_games.append(game)
    
    return {"items": [_to_schema(g) for g in active_games]}


@router.post("", response_model=GameSchema, status_code=201)
def create_game(payload: GameCreate, user_id: str = Depends(auth), session: Session = Depends(get_session)):
    # verificado y 1 partida activa por creador
    u = session.get(User, user_id)
    if not u or not u.is_verified:
        raise HTTPException(status_code=403, detail="Usuario no verificado")
    active_stmt = select(GameModel).where(
        (GameModel.creator_id == user_id) & (GameModel.status.in_(["OPEN", "READY", "RUNNING"]))
    )
    if session.exec(active_stmt).first():
        raise HTTPException(status_code=409, detail="Ya tienes una partida activa")
    # precio mínimo y múltiplos de 0.5
    price = float(payload.price)
    if price < 0.5 or abs((price * 100) % 50) > 1e-6:
        raise HTTPException(status_code=422, detail="Precio inválido (mín 0.5 y múltiplos de 0.5)")

    m = GameModel(
        creator_id=user_id,
        price=price,
        autostart_enabled=payload.autostart_enabled,
        autostart_threshold=payload.autostart_threshold,
        autostart_delay_minutes=payload.autostart_delay_minutes,
    )
    session.add(m)
    session.commit()
    session.refresh(m)
    return _to_schema(m)


@router.post("/{game_id}/start", response_model=GameSchema)
def start_game(game_id: str, user_id: str = Depends(auth), session: Session = Depends(get_session)):
    g = session.get(GameModel, game_id)
    if not g:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    if g.creator_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el creador puede iniciar la partida")
    if g.status != "OPEN":
        raise HTTPException(status_code=409, detail="Estado incompatible para iniciar")
    if (g.sold_tickets or 0) < g.min_tickets:
        raise HTTPException(status_code=409, detail="Aún no se alcanzó el mínimo de cartones")
    g.status = "RUNNING"
    session.add(g)
    session.commit()
    session.refresh(g)
    
    # Broadcast game started
    _broadcast_sync(game_id, "game_started", {
        "game_id": game_id,
        "status": g.status
    })
    
    return _to_schema(g)


@router.post("/{game_id}/cancel", response_model=GameSchema)
def cancel_game(game_id: str, user_id: str = Depends(auth), session: Session = Depends(get_session)):
    """Cancel a game. Only the creator can cancel. Refunds all ticket buyers."""
    g = session.get(GameModel, game_id)
    if not g:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    if g.creator_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el creador puede cancelar la partida")
    if g.status not in ("OPEN", "READY"):
        raise HTTPException(status_code=409, detail="No se puede cancelar una partida en curso o finalizada")
    
    # Refund all tickets
    tickets = session.exec(select(TicketModel).where(TicketModel.game_id == g.id)).all()
    for t in tickets:
        if not t.refunded:
            wallet = session.exec(select(Wallet).where(Wallet.user_id == t.user_id)).first()
            if wallet:
                wallet.balance = float(wallet.balance or 0) + float(g.price)
                session.add(wallet)
                # Create refund transaction
                txn = Transaction(
                    user_id=t.user_id,
                    type="refund",
                    amount=float(g.price),
                    description=f"Reembolso por cancelación · Partida #{g.id[:8]}",
                    reference_id=g.id,
                )
                session.add(txn)
            t.refunded = True
            session.add(t)
    
    g.status = "CANCELLED"
    session.add(g)
    session.commit()
    session.refresh(g)
    
    # Broadcast cancellation
    _broadcast_sync(game_id, "game_cancelled", {
        "game_id": game_id,
        "status": g.status,
        "refunded_tickets": len(tickets)
    })
    
    return _to_schema(g)


def _get_drawn_numbers(g: GameModel) -> List[int]:
    if not g.drawn_numbers:
        return []
    try:
        arr = json.loads(g.drawn_numbers)
        return [int(x) for x in arr if isinstance(x, int) or (isinstance(x, str) and x.isdigit())]
    except Exception:
        return []


def _set_drawn_numbers(g: GameModel, nums: List[int]):
    g.drawn_numbers = json.dumps(nums)
    g.last_drawn_at = datetime.utcnow()


def _ticket_grid(t: TicketModel) -> List[List[int]]:
    try:
        data = json.loads(t.numbers)
        # asegurar 5x5 ints
        grid: List[List[int]] = []
        for i in range(5):
            row_src = data[i] if i < len(data) and isinstance(data[i], list) else []
            row: List[int] = []
            for j in range(5):
                v = row_src[j] if j < len(row_src) else 0
                row.append(int(v))
            grid.append(row)
        return grid
    except Exception:
        return [[0]*5 for _ in range(5)]


def _has_any_diagonal(grid: List[List[int]], drawn: set[int]) -> bool:
    diag1 = all(grid[i][i] in drawn or grid[i][i] == 0 for i in range(5))
    diag2 = all(grid[i][4-i] in drawn or grid[i][4-i] == 0 for i in range(5))
    return diag1 or diag2


def _has_any_line(grid: List[List[int]], drawn: set[int]) -> bool:
    # horizontal lines
    for i in range(5):
        if all(grid[i][j] in drawn or grid[i][j] == 0 for j in range(5)):
            return True
    # vertical lines
    for j in range(5):
        if all(grid[i][j] in drawn or grid[i][j] == 0 for i in range(5)):
            return True
    return False


def _is_bingo(grid: List[List[int]], drawn: set[int]) -> bool:
    return all(grid[i][j] in drawn or grid[i][j] == 0 for i in range(5) for j in range(5))


def _prize_pool(g: GameModel) -> Tuple[float, float, float]:
    gross = float(g.sold_tickets or 0) * float(g.price)
    commission = gross * (float(g.commission_percent) / 100.0)
    pool = gross - commission
    return gross, commission, pool


def _default_scheme():
    # 20% Diagonal, 20% Linea, 50% Bingo (90% of pool)
    # 5% Creator + 5% System = 10% commission (already deducted in _prize_pool)
    return {"DIAGONAL": 22.22, "LINE": 22.22, "BINGO": 55.56}  # Percentages of the 90% prize pool


@router.get("/{game_id}/state", response_model=GameState)
def game_state(game_id: str, session: Session = Depends(get_session)):
    g = session.get(GameModel, game_id)
    if not g:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    drawn = _get_drawn_numbers(g)
    return GameState(
        id=g.id,
        status=g.status, price=g.price, min_tickets=g.min_tickets, sold_tickets=g.sold_tickets,
        drawn_numbers=drawn,
        paid_diagonal=g.paid_diagonal,
        paid_line=g.paid_line,
        paid_bingo=g.paid_bingo,
        creator_id=g.creator_id,
    )


@router.post("/{game_id}/draw", response_model=DrawResponse)
def draw_number(game_id: str, user_id: str = Depends(auth), session: Session = Depends(get_session)):
    g = session.get(GameModel, game_id)
    if not g:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    if g.creator_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el creador puede sortear")
    if g.status != "RUNNING":
        raise HTTPException(status_code=409, detail="El juego no está en ejecución")

    drawn = _get_drawn_numbers(g)
    if len(drawn) >= 75:
        raise HTTPException(status_code=409, detail="No quedan números por sortear")

    remaining = [n for n in range(1, 76) if n not in set(drawn)]
    num = random.choice(remaining)
    drawn.append(num)
    _set_drawn_numbers(g, drawn)

    winners: List[WinnerOut] = []
    drawn_set = set(drawn)
    _, _, pool = _prize_pool(g)
    scheme = _default_scheme()

    # Candidatos
    tickets = session.exec(select(TicketModel).where(TicketModel.game_id == g.id)).all()

    def award(category: str, predicate):
        nonlocal winners
        cat_flag_name = {
            "DIAGONAL": "paid_diagonal",
            "LINE": "paid_line",
            "BINGO": "paid_bingo",
        }[category]
        if getattr(g, cat_flag_name):
            return
        hits: List[TicketModel] = []
        for t in tickets:
            grid = _ticket_grid(t)
            try:
                ok = predicate(grid, drawn_set)
            except Exception:
                ok = False
            if ok:
                hits.append(t)
        if not hits:
            return
        # pagar por partes iguales
        slice_amount = pool * (scheme[category] / 100.0)
        per_winner = slice_amount / len(hits)
        for t in hits:
            w = session.exec(select(Wallet).where(Wallet.user_id == t.user_id)).first()
            if w:
                w.balance = float(w.balance or 0.0) + per_winner
                session.add(w)
                # Create prize transaction
                prize_txn = Transaction(
                    user_id=t.user_id,
                    type="prize",
                    amount=per_winner,
                    description=f"Premio {category} · Partida #{g.id[:8]}",
                    reference_id=g.id,
                )
                session.add(prize_txn)
            # acumular payout y wins
            t.payout = float(t.payout or 0.0) + per_winner
            try:
                winlist = json.loads(t.wins) if t.wins else []
            except Exception:
                winlist = []
            if category not in winlist:
                winlist.append(category)
            t.wins = json.dumps(winlist)
            session.add(t)
            winners.append(WinnerOut(ticket_id=t.id, user_id=t.user_id, amount=per_winner, category=category))
        setattr(g, cat_flag_name, True)

    # Premiación: primero diagonales, luego líneas, y bingo cierra el juego
    award("DIAGONAL", _has_any_diagonal)
    award("LINE", _has_any_line)
    award("BINGO", _is_bingo)

    if g.paid_bingo:
        g.status = "FINISHED"
        g.finished_at = datetime.utcnow()
        
        # Distribute commission to the creator (5% of gross to creator, 5% stays as system revenue)
        gross, commission, _ = _prize_pool(g)
        creator_commission = commission * 0.5  # Half of 10% = 5% for creator
        
        if creator_commission > 0:
            creator_wallet = session.exec(select(Wallet).where(Wallet.user_id == g.creator_id)).first()
            if creator_wallet:
                creator_wallet.balance = float(creator_wallet.balance or 0) + creator_commission
                session.add(creator_wallet)
                
                # Create commission transaction for creator
                commission_txn = Transaction(
                    user_id=g.creator_id,
                    type="commission",
                    amount=creator_commission,
                    description=f"Comisión de creador · Partida #{g.id[:8]}",
                    reference_id=g.id,
                )
                session.add(commission_txn)

    session.add(g)
    session.commit()
    session.refresh(g)
    
    # Broadcast number drawn
    _broadcast_sync(game_id, "number_drawn", {
        "number": num,
        "drawn_numbers": drawn,
        "paid_diagonal": g.paid_diagonal,
        "paid_line": g.paid_line,
        "paid_bingo": g.paid_bingo,
    })
    
    # Broadcast winners
    for w in winners:
        _broadcast_sync(game_id, "winner", {
            "ticket_id": w.ticket_id,
            "user_id": w.user_id,
            "amount": w.amount,
            "category": w.category,
        })
    
    # Broadcast game finished if needed
    if g.status == "FINISHED":
        _broadcast_sync(game_id, "game_finished", {
            "game_id": game_id,
            "status": g.status,
        })
    
    return DrawResponse(number=num, paid_diagonal=g.paid_diagonal, paid_line=g.paid_line, paid_bingo=g.paid_bingo, winners=winners)


@router.get("/{game_id}/my-tickets")
def my_tickets_for_game(game_id: str, user_id: str = Depends(auth), session: Session = Depends(get_session)):
    """Get current user's tickets for a specific game."""
    g = session.get(GameModel, game_id)
    if not g:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    
    tickets = session.exec(
        select(TicketModel).where(
            (TicketModel.game_id == game_id) & (TicketModel.user_id == user_id)
        )
    ).all()
    
    result = []
    for t in tickets:
        try:
            nums = json.loads(t.numbers)
        except Exception:
            nums = []
        result.append({
            "id": t.id,
            "game_id": t.game_id,
            "numbers": nums,
            "payout": t.payout,
            "wins": json.loads(t.wins) if t.wins else [],
        })
    
    return {"items": result}
