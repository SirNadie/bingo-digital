from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import bingo, websockets, auth
from app.database import mongodb

import os

app = FastAPI(title="Bingo Digital API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todos los origins para desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Eventos de startup/shutdown
@app.on_event("startup")
async def startup_event():
    connected = await mongodb.connect()
    if not connected:
        print("⚠️  ADVERTENCIA: No se pudo conectar a MongoDB. Algunas funciones no estarán disponibles.")

@app.on_event("shutdown")
async def shutdown_event():
    await mongodb.disconnect()

# Incluir routers
app.include_router(bingo.router, prefix="/api/bingo")
app.include_router(websockets.router, prefix="/ws")
app.include_router(auth.router, prefix="/auth")

@app.get("/")
def read_root():
    return {"message": "Bingo Digital API", "status": "running"}

@app.get("/health")
async def health_check():
    try:
        db = mongodb.get_database()
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "healthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)