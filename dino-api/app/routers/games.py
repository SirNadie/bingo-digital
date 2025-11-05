from fastapi import APIRouter, Depends, Header, HTTPException
from typing import Optional, List, Tuple
from uuid import UUID

from sqlmodel import select, Session

from app.schemas import Game as GameSchema, GameCreate, GameState, DrawResponse, WinnerOut
from app.models.game import Game as GameModel
from app.core.database import get_session
from app.core.security import get_user_id_from_bearer
from app.models.user import User
from app.models.ticket import Ticket as TicketModel
from app.models.wallet import Wallet
import json
import random
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


@router.get("", response_model=dict)
def list_games(status: Optional[str] = None, session: Session = Depends(get_session)):
    stmt = select(GameModel)
    if status:
        stmt = stmt.where(GameModel.status == status)
    items = session.exec(stmt).all()
    return {"items": [_to_schema(g) for g in items]}


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
    diag1 = all(grid[i][i] in drawn for i in range(5))
    diag2 = all(grid[i][4-i] in drawn for i in range(5))
    return diag1 or diag2


def _has_any_line(grid: List[List[int]], drawn: set[int]) -> bool:
    # horizontal lines
    for i in range(5):
        if all(grid[i][j] in drawn for j in range(5)):
            return True
    # vertical lines
    for j in range(5):
        if all(grid[i][j] in drawn for i in range(5)):
            return True
    return False


def _is_bingo(grid: List[List[int]], drawn: set[int]) -> bool:
    return all(grid[i][j] in drawn for i in range(5) for j in range(5))


def _prize_pool(g: GameModel) -> Tuple[float, float, float]:
    gross = float(g.sold_tickets or 0) * float(g.price)
    commission = gross * (float(g.commission_percent) / 100.0)
    pool = gross - commission
    return gross, commission, pool


def _default_scheme():
    return {"DIAGONAL": 15, "LINE": 25, "BINGO": 60}


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

    session.add(g)
    session.commit()
    session.refresh(g)
    return DrawResponse(number=num, paid_diagonal=g.paid_diagonal, paid_line=g.paid_line, paid_bingo=g.paid_bingo, winners=winners)
