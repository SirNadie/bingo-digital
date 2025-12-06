from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, games
from app.routers import tickets as tickets_router
from app.routers import wallet as wallet_router
from app.core.config import CORS_ORIGINS
from app.core.lifespan import lifespan

app = FastAPI(
    title="Dino Bingo API", 
    version="0.2.0",
    lifespan=lifespan
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth.router)
app.include_router(games.router)
app.include_router(tickets_router.router)
app.include_router(wallet_router.router)

# CORS
_allow_credentials = False if CORS_ORIGINS == ["*"] else True
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)
