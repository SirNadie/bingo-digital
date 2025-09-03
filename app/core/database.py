from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

class MongoDB:
    def __init__(self):
        self.client = AsyncIOMotorClient(settings.DATABASE_URL)
        self.db = self.client.bingo_db

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.client.close()

db = MongoDB()