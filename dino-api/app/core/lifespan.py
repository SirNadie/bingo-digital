from contextlib import asynccontextmanager
from fastapi import FastAPI
import asyncio
from app.core.database import init_db
from app.services.scheduler import housekeeper_task

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    
    # Start background task
    task = asyncio.create_task(housekeeper_task())
    
    yield
    
    # Shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
