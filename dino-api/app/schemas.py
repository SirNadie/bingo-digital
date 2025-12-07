from pydantic import BaseModel, Field
from typing import Literal, List, Optional
from uuid import UUID, uuid4

GameStatus = Literal["CREATED", "OPEN", "READY", "RUNNING", "FINISHED", "CANCELLED"]

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: Literal["Bearer"] = "Bearer"

class GameCreate(BaseModel):
    price: float = Field(ge=0.5, description="Mínimo 0.5")
    autostart_enabled: bool = False
    autostart_threshold: Optional[int] = None
    autostart_delay_minutes: Optional[int] = None

class PrizeSlice(BaseModel):
    type: Literal["DIAGONAL", "LINE", "BINGO"]
    percent: int

class Game(BaseModel):
    id: UUID
    creator_id: str
    price: float
    min_tickets: int = 1
    status: GameStatus = "OPEN"
    sold_tickets: int = 0
    prize_scheme: List[PrizeSlice] = [
        PrizeSlice(type="DIAGONAL", percent=15),
        PrizeSlice(type="LINE", percent=25),
        PrizeSlice(type="BINGO", percent=60),
    ]

def new_game(creator_id: str, price: float) -> Game:
    return Game(id=uuid4(), creator_id=creator_id, price=price)


class MeResponse(BaseModel):
    id: str
    email: str
    balance: float
    alias: Optional[str] = None
    is_verified: bool = True
    is_admin: bool = False


class TicketCreate(BaseModel):
    numbers: List[List[int]]  # 5x5


class TicketOut(BaseModel):
    id: str
    game_id: str
    user_id: str
    numbers: List[List[int]]  # 5x5


class TopUpRequest(BaseModel):
    amount: float = Field(gt=0, description="Monto a acreditar")


class TopUpResponse(BaseModel):
    balance: float


class UpdateProfileRequest(BaseModel):
    alias: Optional[str] = None


# --- Juego en curso ---
PrizeCategory = Literal["DIAGONAL", "LINE", "BINGO"]


class WinnerOut(BaseModel):
    ticket_id: str
    user_id: str
    amount: float
    category: PrizeCategory


class GameState(BaseModel):
    id: str
    status: GameStatus
    price: float
    min_tickets: int
    sold_tickets: int
    drawn_numbers: List[int]
    paid_diagonal: bool
    paid_line: bool
    paid_bingo: bool
    creator_id: str


class DrawResponse(BaseModel):
    number: int
    paid_diagonal: bool
    paid_line: bool
    paid_bingo: bool
    winners: List[WinnerOut]


# --- Transacciones y Estadísticas ---
TransactionTypeLiteral = Literal["deposit", "withdraw", "purchase", "prize", "refund"]


class TransactionOut(BaseModel):
    id: str
    type: TransactionTypeLiteral
    amount: float
    description: str
    reference_id: Optional[str] = None
    created_at: str  # ISO format


class TransactionListResponse(BaseModel):
    transactions: List[TransactionOut]
    total: int


class UserStatsResponse(BaseModel):
    games_played: int
    games_won: int
    win_rate: float  # percentage 0-100
    total_earned: float  # prizes + deposits
    total_spent: float  # purchases + withdrawals
    net_balance: float
    biggest_prize: float
    bingos_won: int
    lines_won: int
    diagonals_won: int
