from datetime import datetime
from typing import Dict, Any, List
import random

def generate_otp_code(length: int = 6) -> str:
    """Generar código OTP numérico"""
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

def validate_phone_number(phone: str) -> bool:
    """Validar formato de número de teléfono"""
    import re
    # Validación internacional básica
    pattern = r'^\+?[1-9]\d{7,14}$'
    return bool(re.match(pattern, phone.replace(" ", "")))

def calculate_payout(pattern: str, prize_structure: Dict[str, int]) -> int:
    """Calcular pago based on winning pattern"""
    return prize_structure.get(pattern, 0)

def can_afford_game(user_credits: int, entry_cost: int, cartons_count: int = 1) -> bool:
    """Verificar si usuario puede pagar el juego"""
    total_cost = entry_cost * cartons_count
    return user_credits >= total_cost

def format_credits(amount: int) -> str:
    """Formatear cantidad de créditos"""
    return f"{amount} créditos"

def get_time_ago(timestamp: datetime) -> str:
    """Obtener tiempo relativo en español"""
    now = datetime.now()
    diff = now - timestamp
    
    if diff.days > 0:
        return f"hace {diff.days} día{'s' if diff.days > 1 else ''}"
    elif diff.seconds >= 3600:
        hours = diff.seconds // 3600
        return f"hace {hours} hora{'s' if hours > 1 else ''}"
    elif diff.seconds >= 60:
        minutes = diff.seconds // 60
        return f"hace {minutes} minuto{'s' if minutes > 1 else ''}"
    else:
        return "hace unos segundos"