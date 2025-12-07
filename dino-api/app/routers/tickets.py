from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional, List
from sqlmodel import Session, select
import json

from app.core.database import get_session
from app.core.security import get_user_id_from_bearer
from app.models.ticket import Ticket as TicketModel
from app.models.game import Game as GameModel
from app.schemas import TicketCreate, TicketOut
from app.models.wallet import Wallet
from app.models.user import User
from app.services.bingo import generate_bingo_card


router = APIRouter(prefix="/tickets", tags=["tickets"])


def _auth(bearer: Optional[str] = Header(None, alias="Authorization")) -> str:
    user_id = get_user_id_from_bearer(bearer)
    if not user_id:
        raise HTTPException(status_code=401, detail="No autorizado")
    return user_id


def _validate_matrix(m: List[List[int]]):
    if not isinstance(m, list) or len(m) != 5:
        raise HTTPException(status_code=422, detail="numbers debe ser 5x5")
    for row in m:
        if not isinstance(row, list) or len(row) != 5:
            raise HTTPException(status_code=422, detail="numbers debe ser 5x5")
        for v in row:
            if not isinstance(v, int):
                raise HTTPException(status_code=422, detail="numbers debe contener enteros")


@router.post("/games/{game_id}", response_model=TicketOut, status_code=201)
def buy_ticket_for_game(game_id: str, payload: TicketCreate, user_id: str = Depends(_auth), session: Session = Depends(get_session)):
    _validate_matrix(payload.numbers)

    game = session.get(GameModel, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    if game.status not in ("OPEN",):
        raise HTTPException(status_code=409, detail="El juego no está abierto para ventas")
    # usuario verificado
    u = session.get(User, user_id)
    if not u or not u.is_verified:
        raise HTTPException(status_code=403, detail="Usuario no verificado")
    # creador no puede jugar su propia partida
    if game.creator_id == user_id:
        raise HTTPException(status_code=403, detail="No puedes jugar tu propia partida")
    # máximo 2 tickets por usuario por partida
    cnt = session.exec(select(TicketModel).where((TicketModel.game_id == game_id) & (TicketModel.user_id == user_id))).all()
    if len(cnt) >= 2:
        raise HTTPException(status_code=409, detail="Máximo 2 cartones por partida")

    # validar y debitar saldo
    w = session.exec(select(Wallet).where(Wallet.user_id == user_id)).first()
    if not w:
        raise HTTPException(status_code=402, detail="Saldo insuficiente")
    price = float(game.price)
    if (w.balance or 0.0) < price:
        raise HTTPException(status_code=402, detail="Saldo insuficiente")

    # crear ticket y actualizar saldos/contador
    t = TicketModel(game_id=game_id, user_id=user_id, numbers=json.dumps(payload.numbers))
    w.balance = float(w.balance) - price
    game.sold_tickets = int(game.sold_tickets or 0) + 1
    # si se alcanza mínimo por primera vez, registrar timestamp
    if (game.sold_tickets >= game.min_tickets) and (not game.reached_min_at):
        from datetime import datetime
        game.reached_min_at = datetime.utcnow()
    session.add_all([t, w, game])
    session.commit()
    session.refresh(t)
    
    # Broadcast player joined
    from app.core.websocket import manager
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(manager.broadcast_to_game(game_id, "player_joined", {
                "game_id": game_id,
                "sold_tickets": game.sold_tickets,
            }))
    except RuntimeError:
        pass
    
    return TicketOut(id=t.id, game_id=t.game_id, user_id=t.user_id, numbers=payload.numbers)


@router.get("/me", response_model=List[TicketOut])
def my_tickets(user_id: str = Depends(_auth), session: Session = Depends(get_session)):
    items = session.exec(select(TicketModel).where(TicketModel.user_id == user_id)).all()
    out: List[TicketOut] = []
    for t in items:
        try:
            nums = json.loads(t.numbers)
        except Exception:
            nums = []
        out.append(TicketOut(id=t.id, game_id=t.game_id, user_id=t.user_id, numbers=nums))
    return out


@router.post("/games/{game_id}/auto", response_model=TicketOut, status_code=201)
def buy_auto_ticket(game_id: str, user_id: str = Depends(_auth), session: Session = Depends(get_session)):
    """
    Buy a ticket with auto-generated bingo card for a game.
    This is a convenience endpoint that generates a valid bingo card automatically.
    """
    # Generate valid bingo card
    card = generate_bingo_card()
    
    # Reuse logic from buy_ticket_for_game
    game = session.get(GameModel, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    if game.status not in ("OPEN",):
        raise HTTPException(status_code=409, detail="El juego no está abierto para ventas")
    # usuario verificado
    u = session.get(User, user_id)
    if not u or not u.is_verified:
        raise HTTPException(status_code=403, detail="Usuario no verificado")
    # creador no puede jugar su propia partida
    if game.creator_id == user_id:
        raise HTTPException(status_code=403, detail="No puedes jugar tu propia partida")
    # máximo 2 tickets por usuario por partida
    cnt = session.exec(select(TicketModel).where((TicketModel.game_id == game_id) & (TicketModel.user_id == user_id))).all()
    if len(cnt) >= 2:
        raise HTTPException(status_code=409, detail="Máximo 2 cartones por partida")

    # validar y debitar saldo
    w = session.exec(select(Wallet).where(Wallet.user_id == user_id)).first()
    if not w:
        raise HTTPException(status_code=402, detail="Saldo insuficiente")
    price = float(game.price)
    if (w.balance or 0.0) < price:
        raise HTTPException(status_code=402, detail="Saldo insuficiente")

    # crear ticket y actualizar saldos/contador
    t = TicketModel(game_id=game_id, user_id=user_id, numbers=json.dumps(card))
    w.balance = float(w.balance) - price
    game.sold_tickets = int(game.sold_tickets or 0) + 1
    if (game.sold_tickets >= game.min_tickets) and (not game.reached_min_at):
        from datetime import datetime
        game.reached_min_at = datetime.utcnow()
    session.add_all([t, w, game])
    session.commit()
    session.refresh(t)
    
    # Broadcast player joined
    from app.core.websocket import manager
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(manager.broadcast_to_game(game_id, "player_joined", {
                "game_id": game_id,
                "sold_tickets": game.sold_tickets,
            }))
    except RuntimeError:
        pass
    
    return TicketOut(id=t.id, game_id=t.game_id, user_id=t.user_id, numbers=card)

