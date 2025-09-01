from pydantic import BaseModel, Field, validator
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
import re
import random

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    GAME_PURCHASE = "game_purchase"
    PRIZE = "prize"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class GameStatus(str, Enum):
    WAITING = "waiting"
    ACTIVE = "active"
    FINISHED = "finished"

class User(BaseModel):
    user_id: str = Field(default_factory=lambda: f"user_{random.randint(10000, 99999)}")
    phone: str
    credits: int = Field(default=0, ge=0)
    role: UserRole = UserRole.USER
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    last_login: Optional[datetime] = None
    total_won: int = 0
    total_played: int = 0

    @validator('phone')
    def validate_phone(cls, v):
        # Validación básica de teléfono - puedes ajustar según tu país
        if not re.match(r'^\+?[1-9]\d{7,14}$', v.replace(" ", "")):
            raise ValueError('Formato de teléfono inválido')
        return v.replace(" ", "")  # Remover espacios

class Transaction(BaseModel):
    transaction_id: str = Field(default_factory=lambda: f"tx_{random.randint(10000, 99999)}_{datetime.now().timestamp()}")
    user_id: str
    type: TransactionType
    amount: int = Field(ge=0)
    status: TransactionStatus = TransactionStatus.PENDING
    description: str
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    processed_at: Optional[datetime] = None

class Player(BaseModel):
    user_id: str  # Relación con usuario
    player_id: str = Field(default_factory=lambda: f"player_{random.randint(1000, 9999)}")
    name: str
    game_id: str
    score: int = 0
    credits_balance: int = 0
    cartons: List[List[List[str]]] = []  # Múltiples cartones
    marked_numbers: List[str] = []
    continue_playing: bool = False
    patterns_won: List[str] = []
    joined_at: datetime = Field(default_factory=datetime.now)

class BingoGame(BaseModel):
    game_id: str = Field(default_factory=lambda: f"game_{random.randint(1000, 9999)}")
    name: str
    status: GameStatus = GameStatus.WAITING
    players: List[Player] = []
    drawn_numbers: List[str] = []
    winner: Optional[str] = None
    winning_pattern: Optional[str] = None
    entry_cost: int = 10  # Costo de entrada en créditos
    prize_structure: Dict[str, int] = Field(default_factory=lambda: {
        "bingo_completo": 100,
        "diagonal_principal": 50,
        "diagonal_secundaria": 50,
        "linea_horizontal": 50,
        "linea_vertical": 50,
        "cuatro_esquinas": 40
    })
    created_by: str  # user_id del creador
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

# Modelos para requests (mantener compatibilidad)
class CreateGameRequest(BaseModel):
    name: str
    entry_cost: Optional[int] = 10
    prize_structure: Optional[Dict[str, int]] = None

class JoinGameRequest(BaseModel):
    game_id: str
    cartons_count: int = Field(1, ge=1, le=5)  # 1-5 cartones

class StartGameRequest(BaseModel):
    game_id: str

# Nuevos modelos para el sistema de autenticación y transacciones
class LoginRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    code: str

class DepositRequest(BaseModel):
    amount: int = Field(ge=10, le=1000)  # Mínimo 10, máximo 1000
    payment_method: str

class WithdrawalRequest(BaseModel):
    amount: int = Field(ge=10, le=500)  # Mínimo 10, máximo 500

class AdminAdjustmentRequest(BaseModel):
    user_id: str
    amount: int
    reason: str