from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import bingo, websockets 
from app.database import mongodb
import os

app = FastAPI(title="Bingo Digital API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
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

@app.get("/")
def read_root():
    return {"message": "Bingo Digital API", "status": "running"}

@app.get("/health")
async def health_check():
    # Verificar si la base de datos está conectada
    try:
        db = mongodb.get_database()
        # Hacer un ping para verificar la conexión
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "healthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)