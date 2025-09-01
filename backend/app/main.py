from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import bingo  # ✅ Import corregido
from app.database import mongodb
import os

app = FastAPI(title="Bingo Digital API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Eventos de startup/shutdown
@app.on_event("startup")
async def startup_event():
    await mongodb.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await mongodb.disconnect()

# Incluir routers
app.include_router(bingo.router, prefix="/api/bingo")

@app.get("/")
def read_root():
    return {"message": "Bingo Digital API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)