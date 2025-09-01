from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Player(BaseModel):
    name: str
    score: int = 0

class BingoGame(BaseModel):
    name: str
    players: List[Player] = []
    created_at: Optional[str] = datetime.utcnow().isoformat()
