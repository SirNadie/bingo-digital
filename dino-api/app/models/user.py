from __future__ import annotations
from typing import Optional, TYPE_CHECKING, ClassVar, Any
from uuid import uuid4

from sqlmodel import SQLModel, Field



class User(SQLModel, table=True):
    __tablename__: ClassVar[Any] = "users"  # ✅ silencia Pylance, runtime OK

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_verified: bool = True
    is_admin: bool = False
    alias: Optional[str] = None


