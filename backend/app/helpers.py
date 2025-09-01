from datetime import datetime
from typing import Dict, Any, List, Optional
import random
import re
from bson import ObjectId  # ← AÑADIR esta importación
import json

def generate_otp_code(length: int = 6) -> str:
    """Generar código OTP numérico"""
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

def validate_phone_number(phone: str) -> bool:
    """Validar formato de número de teléfono"""
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

# Approach alternativo sin depender de bson
def convert_objectid(data: Any) -> Any:
    """
    Recursively convert ObjectId-like objects to string
    """
    if isinstance(data, list):
        return [convert_objectid(item) for item in data]
    elif isinstance(data, dict):
        return {key: convert_objectid(value) for key, value in data.items()}
    elif hasattr(data, '__class__') and 'ObjectId' in str(data.__class__):
        # Detectar ObjectId por el nombre de clase
        return str(data)
    elif isinstance(data, datetime):
        return data.isoformat()
    else:
        return data

def serialize_mongo_document(doc: Dict) -> Dict:
    """
    Serialize MongoDB document for JSON response
    """
    if doc is None:
        return None
    
    # Convert ObjectId and other non-serializable types
    serialized = convert_objectid(doc)
    
    # Remove MongoDB internal fields if desired
    serialized.pop('_id', None)
    
    return serialized