import asyncio
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.core.database import engine
from app.models.game import Game
from app.models.ticket import Ticket
from app.models.wallet import Wallet
import traceback


async def housekeeper_task():
    """Background task to manage game states and auto-start games."""
    while True:
        try:
            now = datetime.utcnow()
            with Session(engine) as session:
                games_open = session.exec(select(Game).where(Game.status == "OPEN")).all()
                for g in games_open:
                    sold = g.sold_tickets or 0
                    
                    # --- AUTO-START LOGIC ---
                    if g.autostart_enabled and g.autostart_threshold:
                        # Check if threshold is reached
                        if sold >= g.autostart_threshold:
                            # Record when threshold was reached
                            if not g.reached_threshold_at:
                                g.reached_threshold_at = now
                                session.add(g)
                            else:
                                # Wait for delay before starting (default 0 = immediate)
                                delay_minutes = g.autostart_delay_minutes or 0
                                if now - g.reached_threshold_at >= timedelta(minutes=delay_minutes):
                                    g.status = "RUNNING"
                                    session.add(g)
                                    continue
                    
                    # --- MINIMUM TICKETS LOGIC (for manual start games) ---
                    if sold >= g.min_tickets:
                        if not g.reached_min_at:
                            g.reached_min_at = now
                            session.add(g)
                    
                    # --- EXPIRATION LOGIC ---
                    # Cancel games that don't reach minimum after 24 hours
                    game_age = now - (g.created_at or now)
                    if game_age > timedelta(hours=24):
                        if sold < g.min_tickets:
                            cancel_and_refund(session, g)
                            continue
                        
                        # For manual-start games without autostart: 
                        # Cancel if min reached but not started within 2 hours
                        if not g.autostart_enabled and g.reached_min_at:
                            time_since_min = now - g.reached_min_at
                            if time_since_min > timedelta(hours=2):
                                cancel_and_refund(session, g)
                                continue
                
                session.commit()
        except Exception:
            traceback.print_exc()
        await asyncio.sleep(60)


def cancel_and_refund(session: Session, g: Game):
    """Cancels a game and refunds all non-refunded tickets."""
    price = float(g.price)
    tickets = session.exec(
        select(Ticket).where((Ticket.game_id == g.id) & (Ticket.refunded == False))
    ).all()
    for t in tickets:
        w = session.exec(select(Wallet).where(Wallet.user_id == t.user_id)).first()
        if w:
            w.balance = float(w.balance or 0.0) + price
            session.add(w)
        t.refunded = True
        session.add(t)
    g.status = "CANCELLED"
    session.add(g)
