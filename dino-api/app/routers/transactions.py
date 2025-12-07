from fastapi import APIRouter, Depends, Header, HTTPException, Query
from typing import Optional, Literal
from sqlmodel import Session, select, func, desc
from datetime import datetime, timedelta
import json

from app.core.database import get_session
from app.core.security import get_user_id_from_bearer
from app.models.transaction import Transaction
from app.models.ticket import Ticket
from app.models.game import Game
from app.schemas import TransactionOut, TransactionListResponse, UserStatsResponse


router = APIRouter(prefix="/transactions", tags=["transactions"])


def _auth(bearer: Optional[str] = Header(None, alias="Authorization")) -> str:
    user_id = get_user_id_from_bearer(bearer)
    if not user_id:
        raise HTTPException(status_code=401, detail="No autorizado")
    return user_id


@router.get("/me", response_model=TransactionListResponse)
def get_my_transactions(
    user_id: str = Depends(_auth),
    session: Session = Depends(get_session),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    type_filter: Optional[str] = Query(None, alias="type"),
    days: Optional[int] = Query(None, ge=1, le=365),
):
    """Get transactions for the authenticated user with optional filters."""
    query = select(Transaction).where(Transaction.user_id == user_id)
    
    # Apply type filter
    if type_filter:
        query = query.where(Transaction.type == type_filter)
    
    # Apply date range filter
    if days:
        min_date = datetime.utcnow() - timedelta(days=days)
        query = query.where(Transaction.created_at >= min_date)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()
    
    # Apply pagination and ordering
    query = query.order_by(desc(Transaction.created_at)).offset(offset).limit(limit)
    transactions = session.exec(query).all()
    
    return TransactionListResponse(
        transactions=[
            TransactionOut(
                id=t.id,
                type=t.type,
                amount=t.amount,
                description=t.description,
                reference_id=t.reference_id,
                created_at=t.created_at.isoformat() if t.created_at else "",
            )
            for t in transactions
        ],
        total=total,
    )


@router.get("/stats", response_model=UserStatsResponse)
def get_my_stats(
    user_id: str = Depends(_auth),
    session: Session = Depends(get_session),
    days: Optional[int] = Query(None, ge=1, le=365),
):
    """Get computed statistics for the authenticated user."""
    
    # Get all user tickets
    tickets_query = select(Ticket).where(Ticket.user_id == user_id)
    tickets = session.exec(tickets_query).all()
    
    games_played = len(tickets)
    games_won = 0
    bingos_won = 0
    lines_won = 0
    diagonals_won = 0
    biggest_prize = 0.0
    
    for ticket in tickets:
        if ticket.payout and ticket.payout > 0:
            games_won += 1
            if ticket.payout > biggest_prize:
                biggest_prize = ticket.payout
            # Parse wins JSON
            if ticket.wins:
                try:
                    wins_list = json.loads(ticket.wins)
                    for w in wins_list:
                        if w == "BINGO":
                            bingos_won += 1
                        elif w == "LINE":
                            lines_won += 1
                        elif w == "DIAGONAL":
                            diagonals_won += 1
                except:
                    pass
    
    win_rate = (games_won / games_played * 100) if games_played > 0 else 0.0
    
    # Get transaction totals
    txn_query = select(Transaction).where(Transaction.user_id == user_id)
    if days:
        min_date = datetime.utcnow() - timedelta(days=days)
        txn_query = txn_query.where(Transaction.created_at >= min_date)
    
    transactions = session.exec(txn_query).all()
    
    total_earned = sum(t.amount for t in transactions if t.amount > 0)
    total_spent = abs(sum(t.amount for t in transactions if t.amount < 0))
    net_balance = total_earned - total_spent
    
    return UserStatsResponse(
        games_played=games_played,
        games_won=games_won,
        win_rate=round(win_rate, 1),
        total_earned=total_earned,
        total_spent=total_spent,
        net_balance=net_balance,
        biggest_prize=biggest_prize,
        bingos_won=bingos_won,
        lines_won=lines_won,
        diagonals_won=diagonals_won,
    )
