from __future__ import annotations
from typing import Optional, ClassVar, Any, Literal
from uuid import uuid4
from datetime import datetime

from sqlmodel import SQLModel, Field

TransactionType = Literal["deposit", "withdraw", "purchase", "prize", "refund"]


class Transaction(SQLModel, table=True):
    __tablename__: ClassVar[Any] = "transactions"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    type: str  # deposit, withdraw, purchase, prize, refund
    amount: float  # positive for income, negative for expenses
    description: str
    reference_id: Optional[str] = None  # game_id, ticket_id, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
