from __future__ import annotations
from typing import Optional, TYPE_CHECKING, ClassVar, Any
from uuid import uuid4

from sqlmodel import SQLModel, Field

# Import en tiempo de ejecución para asegurar que Wallet está registrada
# from .wallet import Wallet  # no necesario sin Relationship

class User(SQLModel, table=True):
    __tablename__: ClassVar[Any] = "users"  # ✅ silencia Pylance, runtime OK

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_verified: bool = True
    alias: Optional[str] = None

    # Relación 1:1 eliminada temporalmente para evitar conflictos de resolución
    # (se puede restaurar cuando migremos a anotaciones Mapped[] o unifiquemos modelos)
