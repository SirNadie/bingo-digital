from __future__ import annotations
from typing import Optional, TYPE_CHECKING, ClassVar, Any
from uuid import uuid4

from sqlmodel import SQLModel, Field

if TYPE_CHECKING:
    from .user import User

class Wallet(SQLModel, table=True):
    __tablename__: ClassVar[Any] = "wallets"  # ✅ silencia Pylance, runtime OK

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", unique=True)  # coincide con User.__tablename__
    balance: float = 0.0

    # Relación removida temporalmente; mantiene FK user_id y unique
