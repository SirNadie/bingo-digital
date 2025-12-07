from sqlmodel import SQLModel, Field
from typing import Optional, ClassVar, Any
from uuid import uuid4
from datetime import datetime

class Game(SQLModel, table=True):
    __tablename__: ClassVar[Any] = "games"  # nombre de tabla explícito
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    creator_id: str
    price: float
    min_tickets: int = 1
    status: str = "OPEN"  # CREATED | OPEN | READY | RUNNING | FINISHED | CANCELLED
    sold_tickets: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reached_min_at: Optional[datetime] = None
    autostart_enabled: bool = False
    autostart_threshold: Optional[int] = None
    autostart_delay_minutes: Optional[int] = None
    reached_threshold_at: Optional[datetime] = None  # When autostart threshold was reached
    commission_percent: float = 10.0

    # Estado de sorteo y pago de premios
    drawn_numbers: Optional[str] = None  # JSON list de ints (1..75)
    last_drawn_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    paid_diagonal: bool = False
    paid_line: bool = False
    paid_bingo: bool = False
