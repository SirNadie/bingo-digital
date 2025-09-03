from fastapi import FastAPI
from contextlib import asynccontextmanager
from .core.database import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Connecting to MongoDB...")
    db.client
    yield
    print("Disconnecting from MongoDB...")
    db.client.close()

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Welcome to Bingo Digital!"}