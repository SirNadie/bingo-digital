from pydantic import BaseModel
from typing import List, Optional

class Player(BaseModel):
    username: str
    email: str

class Game(BaseModel):
    name: str
    board: Optional[List[List[int]]] = []
    players: Optional[List[Player]] = []
