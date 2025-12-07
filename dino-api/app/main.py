from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.routers import auth, games
from app.routers import tickets as tickets_router
from app.routers import wallet as wallet_router
from app.routers import websocket as websocket_router
from app.routers import transactions as transactions_router
from app.routers import admin as admin_router
from app.core.config import CORS_ORIGINS
from app.core.lifespan import lifespan
from app.core.limiter import limiter

app = FastAPI(
    title="Dino Bingo API", 
    version="0.3.0",
    lifespan=lifespan
)

# Rate Limiter Setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS - Must be added before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# REST routers
app.include_router(auth.router)
app.include_router(games.router)
app.include_router(tickets_router.router)
app.include_router(wallet_router.router)
app.include_router(transactions_router.router)
app.include_router(admin_router.router)

# WebSocket router
app.include_router(websocket_router.router)
