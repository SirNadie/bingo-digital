from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Optional
from datetime import datetime

class GameStatus(str, Enum):
    WAITING = "waiting"
    ACTIVE = "active"
    FINISHED = "finished"

class Player(BaseModel):
    player_id: str
    name: str
    game_id: str
    score: int = 0
    joined_at: datetime = Field(default_factory=datetime.now)

class BingoGame(BaseModel):
    game_id: str
    name: str
    status: GameStatus = GameStatus.WAITING
    players: List[Player] = []
    drawn_numbers: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class CreateGameRequest(BaseModel):
    name: str

class JoinGameRequest(BaseModel):
    game_id: str
    player_name: str

class StartGameRequest(BaseModel):
    game_id: str
