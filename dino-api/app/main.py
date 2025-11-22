from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db
from app.routers import auth, games
from app.routers import tickets as tickets_router
from app.routers import wallet as wallet_router
from app.core.config import CORS_ORIGINS

app = FastAPI(title="Dino Bingo API", version="0.2.0")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth.router)
app.include_router(games.router)
app.include_router(tickets_router.router)
app.include_router(wallet_router.router)

# CORS para desarrollo
_allow_credentials = False if CORS_ORIGINS == ["*"] else True
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tareas de mantenimiento: cancelación y auto-inicio
import asyncio
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.core.database import engine
from app.models.game import Game
from app.models.ticket import Ticket
from app.models.wallet import Wallet


async def _housekeeper():
    while True:
        try:
            now = datetime.utcnow()
            with Session(engine) as session:
                # Reglas sobre juegos en estado OPEN
                games_open = session.exec(select(Game).where(Game.status == "OPEN")).all()
                for g in games_open:
                    # 24h sin alcanzar mínimo => cancelar y reembolsar
                    if (g.sold_tickets or 0) < g.min_tickets and (now - (g.created_at or now)) > timedelta(hours=24):
                        _cancel_and_refund(session, g)
                        continue
                    # alcanzó mínimo
                    if (g.sold_tickets or 0) >= g.min_tickets:
                        if not g.reached_min_at:
                            g.reached_min_at = now
                            session.add(g)
                        else:
                            # pasaron 30 min tras alcanzar mínimo
                            if now - g.reached_min_at > timedelta(minutes=30):
                                if g.autostart_enabled and (
                                    (g.autostart_threshold is None or (g.sold_tickets or 0) >= g.autostart_threshold)
                                ) and (g.autostart_delay_minutes or 0) <= 30:
                                    # iniciar
                                    g.status = "RUNNING"
                                    session.add(g)
                                else:
                                    # cancelar
                                    _cancel_and_refund(session, g)
                session.commit()
        except Exception:
            # en producción, loguear stacktrace
            import traceback
            traceback.print_exc()
        await asyncio.sleep(60)


def _cancel_and_refund(session: Session, g: Game):
    # reembolsar por tickets no reembolsados
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


@app.on_event("startup")
async def _start_housekeeper():
    # arrancar en background
    asyncio.create_task(_housekeeper())
