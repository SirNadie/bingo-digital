from fastapi import APIRouter, Depends, Header, HTTPException
from typing import Optional, List
from sqlmodel import Session, select, func
from datetime import datetime, timedelta

from app.core.database import get_session
from app.core.security import get_user_id_from_bearer
from app.models.user import User
from app.models.wallet import Wallet
from app.models.game import Game
from app.models.ticket import Ticket
from app.models.transaction import Transaction


router = APIRouter(prefix="/admin", tags=["admin"])


def _admin_auth(bearer: Optional[str] = Header(None, alias="Authorization"), session: Session = Depends(get_session)) -> User:
    """Verify user is authenticated and is an admin."""
    user_id = get_user_id_from_bearer(bearer)
    if not user_id:
        raise HTTPException(status_code=401, detail="No autorizado")
    user = session.get(User, user_id)
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Acceso denegado - se requiere rol de administrador")
    return user


@router.get("/stats")
def get_admin_stats(admin: User = Depends(_admin_auth), session: Session = Depends(get_session)):
    """Get global KPIs for admin dashboard."""
    # Total users (excluding admins)
    total_users = session.exec(
        select(func.count()).select_from(User).where(User.is_admin == False)
    ).one()
    
    # Active games (OPEN or RUNNING)
    active_games = session.exec(
        select(func.count()).select_from(Game).where(Game.status.in_(["OPEN", "RUNNING"]))
    ).one()
    
    # Total revenue (deposits)
    total_revenue = session.exec(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            (Transaction.type == "deposit")
        )
    ).one()
    
    # Today's transactions
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_transactions = session.exec(
        select(func.count()).select_from(Transaction).where(
            Transaction.created_at >= today_start
        )
    ).one()
    
    # Total games played (FINISHED)
    total_games_finished = session.exec(
        select(func.count()).select_from(Game).where(Game.status == "FINISHED")
    ).one()
    
    # Total pot accumulated
    total_pot = session.exec(
        select(func.coalesce(func.sum(Game.sold_tickets * Game.price), 0)).select_from(Game).where(Game.status == "FINISHED")
    ).one()

    # Total system revenue (50% of total commission from finished games)
    # Commission is commission_percent of gross, system gets half of that (other half is creator)
    total_system_revenue = session.exec(
        select(func.coalesce(func.sum(
            (Game.sold_tickets * Game.price) * (Game.commission_percent / 100.0) * 0.5
        ), 0)).select_from(Game).where(Game.status == "FINISHED")
    ).one()
    
    return {
        "total_users": total_users,
        "active_games": active_games,
        "total_revenue": float(total_revenue or 0),
        "today_transactions": today_transactions,
        "total_games_finished": total_games_finished,
        "total_pot": float(total_pot or 0),
        "total_system_revenue": float(total_system_revenue or 0),
    }


@router.get("/users")
def get_admin_users(
    admin: User = Depends(_admin_auth), 
    session: Session = Depends(get_session),
    limit: int = 50,
    offset: int = 0,
):
    """Get list of all users for admin panel."""
    users = session.exec(
        select(User).where(User.is_admin == False).offset(offset).limit(limit)
    ).all()
    
    result = []
    for user in users:
        # Get wallet balance
        wallet = session.exec(select(Wallet).where(Wallet.user_id == user.id)).first()
        balance = float(wallet.balance) if wallet else 0.0
        
        # Count games played
        games_played = session.exec(
            select(func.count()).select_from(Ticket).where(Ticket.user_id == user.id)
        ).one()
        
        # Determine status
        if user.is_verified:
            status = "Activo"
            tone = "success"
        else:
            status = "Pendiente"
            tone = "warning"
        
        result.append({
            "id": user.id,
            "alias": user.alias or user.email.split("@")[0],
            "email": user.email,
            "status": status,
            "tone": tone,
            "balance": balance,
            "last_seen": "Reciente",  # Would need session tracking for real data
            "games_played": games_played,
        })
    
    return {"items": result}


@router.get("/games")
def get_admin_games(
    admin: User = Depends(_admin_auth),
    session: Session = Depends(get_session),
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    """Get list of all games for admin panel."""
    query = select(Game)
    if status_filter:
        query = query.where(Game.status == status_filter)
    query = query.order_by(Game.created_at.desc()).offset(offset).limit(limit)
    
    games = session.exec(query).all()
    
    result = []
    for game in games:
        # Get creator info
        creator = session.get(User, game.creator_id)
        creator_name = creator.alias or creator.email.split("@")[0] if creator else "Desconocido"
        
        # Calculate pot
        pot = float(game.sold_tickets or 0) * float(game.price)
        
        # Determine tone based on status
        tone_map = {
            "OPEN": "info",
            "RUNNING": "success",
            "FINISHED": "warning",
            "CANCELLED": "danger",
        }
        
        # Format schedule
        if game.status == "RUNNING":
            schedule = "En vivo"
        elif game.status == "FINISHED":
            schedule = "Finalizada"
        elif game.status == "CANCELLED":
            schedule = "Cancelada"
        else:
            schedule = f"Creada {game.created_at.strftime('%d/%m %H:%M')}" if game.created_at else "Abierta"
        
        result.append({
            "id": game.id,
            "name": f"Partida #{game.id[:8]}",
            "host": creator_name,
            "schedule": schedule,
            "reward": f"Comisión {game.commission_percent}%",
            "status": game.status,
            "tone": tone_map.get(game.status, "info"),
            "buy_in": float(game.price),
            "pot": pot,
            "players": game.sold_tickets or 0,
            "capacity": "∞",
        })
    
    return {"items": result}


@router.get("/transactions")
def get_admin_transactions(
    admin: User = Depends(_admin_auth),
    session: Session = Depends(get_session),
    limit: int = 50,
    offset: int = 0,
):
    """Get all transactions for admin panel."""
    transactions = session.exec(
        select(Transaction)
        .order_by(Transaction.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    result = []
    for txn in transactions:
        # Get user info
        user = session.get(User, txn.user_id)
        user_name = user.alias or user.email.split("@")[0] if user else "Desconocido"
        
        # Map type to admin format
        type_map = {
            "deposit": "deposit",
            "withdraw": "withdraw",
            "purchase": "withdraw",
            "prize": "deposit",
            "refund": "deposit",
        }
        
        result.append({
            "id": txn.id,
            "user": user_name,
            "timestamp": txn.created_at.strftime("%Y-%m-%d %H:%M") if txn.created_at else "",
            "amount": txn.amount,
            "type": type_map.get(txn.type, "deposit"),
            "status": txn.status or "pending",
        })
    
    return {"items": result}


@router.get("/activity")
def get_admin_activity(
    admin: User = Depends(_admin_auth),
    session: Session = Depends(get_session),
    limit: int = 10,
):
    """Get recent activity for admin dashboard."""
    # Get recent transactions
    recent_txns = session.exec(
        select(Transaction)
        .order_by(Transaction.created_at.desc())
        .limit(limit)
    ).all()
    
    result = []
    for txn in recent_txns:
        user = session.get(User, txn.user_id)
        user_name = user.alias or user.email.split("@")[0] if user else "Desconocido"
        
        # Format time ago
        if txn.created_at:
            delta = datetime.utcnow() - txn.created_at
            if delta.seconds < 60:
                time_ago = "Hace un momento"
            elif delta.seconds < 3600:
                time_ago = f"Hace {delta.seconds // 60} min"
            elif delta.seconds < 86400:
                time_ago = f"Hace {delta.seconds // 3600} h"
            else:
                time_ago = f"Hace {delta.days} días"
        else:
            time_ago = "Reciente"
        
        # Icon and tone based on type
        type_config = {
            "deposit": {"icon": "south_west", "tone": "success", "badge": "Depósito"},
            "withdraw": {"icon": "north_east", "tone": "warning", "badge": "Retiro"},
            "purchase": {"icon": "shopping_cart", "tone": "primary", "badge": "Compra"},
            "prize": {"icon": "emoji_events", "tone": "success", "badge": "Premio"},
            "refund": {"icon": "replay", "tone": "warning", "badge": "Reembolso"},
        }
        config = type_config.get(txn.type, type_config["deposit"])
        
        result.append({
            "id": txn.id,
            "icon": config["icon"],
            "tone": config["tone"],
            "title": user_name,
            "description": txn.description,
            "time": time_ago,
            "amount": f"{'+' if txn.amount > 0 else ''}{txn.amount:.0f} cr",
            "badge": config["badge"],
        })
    
    return {"items": result}


@router.post("/transactions/{txn_id}/approve")
def approve_transaction(
    txn_id: str,
    admin: User = Depends(_admin_auth),
    session: Session = Depends(get_session),
):
    """Approve a pending transaction."""
    txn = session.get(Transaction, txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    if txn.status != "pending":
        raise HTTPException(status_code=400, detail="La transacción no está pendiente")
    
    # Process approval based on type
    if txn.type == "deposit":
        # Credit user wallet
        wallet = session.exec(select(Wallet).where(Wallet.user_id == txn.user_id)).first()
        if wallet:
            wallet.balance = float(wallet.balance or 0) + txn.amount
            session.add(wallet)
    
    elif txn.type == "withdraw":
        # Money was already deducted (reserved), so just mark approved
        pass
        
    txn.status = "approved"
    session.add(txn)
    session.commit()
    
    return {"status": "approved"}


@router.post("/transactions/{txn_id}/reject")
def reject_transaction(
    txn_id: str,
    admin: User = Depends(_admin_auth),
    session: Session = Depends(get_session),
):
    """Reject a pending transaction."""
    txn = session.get(Transaction, txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    if txn.status != "pending":
        raise HTTPException(status_code=400, detail="La transacción no está pendiente")
    
    # Process rejection based on type
    if txn.type == "deposit":
        # Just mark rejected, money was never added
        pass
    
    elif txn.type == "withdraw":
        # Refund the reserved money
        wallet = session.exec(select(Wallet).where(Wallet.user_id == txn.user_id)).first()
        if wallet:
            wallet.balance = float(wallet.balance or 0) + abs(txn.amount)
            session.add(wallet)
            
    txn.status = "rejected"
    session.add(txn)
    session.commit()
    
    return {"status": "rejected"}
