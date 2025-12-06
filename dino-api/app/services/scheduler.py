import asyncio
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.core.database import engine
from app.models.game import Game
from app.models.ticket import Ticket
from app.models.wallet import Wallet
import traceback

async def housekeeper_task():
    """Background task to manage game states."""
    while True:
        try:
            now = datetime.utcnow()
            with Session(engine) as session:
                games_open = session.exec(select(Game).where(Game.status == "OPEN")).all()
                for g in games_open:
                    # 24h checks
                    if (g.sold_tickets or 0) < g.min_tickets and (now - (g.created_at or now)) > timedelta(hours=24):
                        cancel_and_refund(session, g)
                        continue
                    
                    # Min tickets reached checks
                    if (g.sold_tickets or 0) >= g.min_tickets:
                        if not g.reached_min_at:
                            g.reached_min_at = now
                            session.add(g)
                        else:
                            # 30 min delay logic
                            if now - g.reached_min_at > timedelta(minutes=30):
                                if g.autostart_enabled and (
                                    (g.autostart_threshold is None or (g.sold_tickets or 0) >= g.autostart_threshold)
                                ) and (g.autostart_delay_minutes or 0) <= 30:
                                    g.status = "RUNNING"
                                    session.add(g)
                                else:
                                    cancel_and_refund(session, g)
                session.commit()
        except Exception:
            traceback.print_exc()
        await asyncio.sleep(60)

def cancel_and_refund(session: Session, g: Game):
    """Cancels a game and refunds all non-refunded tickets."""
    price = float(g.price)
    tickets = session.exec(select(Ticket).where((Ticket.game_id == g.id) & (Ticket.refunded == False))).all()
    for t in tickets:
        w = session.exec(select(Wallet).where(Wallet.user_id == t.user_id)).first()
        if w:
            w.balance = float(w.balance or 0.0) + price
            session.add(w)
        t.refunded = True
        session.add(t)
    g.status = "CANCELLED"
    session.add(g)
