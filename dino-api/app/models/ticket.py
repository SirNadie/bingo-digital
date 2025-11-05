from sqlmodel import SQLModel, Field
from typing import Optional, ClassVar, Any
from uuid import uuid4

class Ticket(SQLModel, table=True):
    __tablename__: ClassVar[Any] = "tickets"
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    # FK deben coincidir con los __tablename__ de los modelos referenciados
    game_id: str = Field(foreign_key="games.id")
    user_id: str = Field(foreign_key="users.id")
    numbers: str  # JSON string con la matriz 5x5
    refunded: bool = False
    # Registro de premios
    payout: float = 0.0
    wins: Optional[str] = None  # JSON list de strings ["DIAGONAL","LINE","BINGO"]
