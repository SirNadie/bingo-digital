from fastapi import FastAPI
from server.routes import bingo

app = FastAPI(title="Bingo Digital API")

# Registrar rutas
app.include_router(bingo.router, prefix="/api/bingo", tags=["Bingo"])

@app.get("/")
def root():
    return {"message": "Bienvenido a Bingo Digital API"}
