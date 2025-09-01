import random
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
import jwt
from ..database import get_database, mongodb  # ← AÑADIR mongodb
from ..models import User, UserRole
from ..utils.helpers import generate_otp_code, validate_phone_number
import os
from dotenv import load_dotenv

load_dotenv()

class AuthService:
    def __init__(self):
        self.db = None  # ← Inicializar como None
        self.otp_storage: Dict[str, Dict] = {}
        self.jwt_secret = os.getenv("JWT_SECRET", "bingo_dev_secret_2024")
        self.jwt_algorithm = "HS256"
    
    async def _get_db(self):
        """Obtener la base de datos de forma lazy"""
        if self.db is None:
            self.db = get_database()
        return self.db
    
    async def request_otp(self, phone: str) -> Tuple[bool, str]:
        """Solicitar código OTP para un teléfono"""
        try:
            # Validar formato de teléfono
            if not validate_phone_number(phone):
                return False, "Formato de teléfono inválido"
            
            # Generar código OTP
            otp_code = generate_otp_code()
            expires_at = datetime.now() + timedelta(minutes=5)
            
            # Guardar en almacenamiento temporal
            self.otp_storage[phone] = {
                'code': otp_code,
                'expires': expires_at,
                'attempts': 0,
                'created_at': datetime.now()
            }
            
            # SIMULACIÓN: En lugar de enviar SMS real, imprimimos en consola
            print(f"📱 SMS SIMULADO para {phone}:")
            print(f"   🔐 Su código de verificación es: {otp_code}")
            print(f"   ⏰ Expira a las: {expires_at.strftime('%H:%M:%S')}")
            print("-" * 50)
            
            return True, "Código enviado exitosamente"
            
        except Exception as e:
            print(f"Error en request_otp: {e}")
            return False, "Error al enviar código"
    
    async def verify_otp(self, phone: str, otp_code: str) -> Tuple[bool, Optional[User], str]:
        """Verificar código OTP y crear/obtener usuario"""
        try:
            # Verificar si existe OTP para este teléfono
            if phone not in self.otp_storage:
                return False, None, "Código no encontrado o expirado"
            
            otp_data = self.otp_storage[phone]
            
            # Verificar intentos (máximo 3 intentos)
            if otp_data['attempts'] >= 3:
                del self.otp_storage[phone]
                return False, None, "Demasiados intentos fallidos"
            
            # Verificar expiración
            if datetime.now() > otp_data['expires']:
                del self.otp_storage[phone]
                return False, None, "Código expirado"
            
            # Verificar código
            if otp_data['code'] != otp_code:
                otp_data['attempts'] += 1
                return False, None, "Código incorrecto"
            
            # Código válido - limpiar OTP
            del self.otp_storage[phone]
            
            # Obtener base de datos
            db = await self._get_db()  # ← USAR método lazy
            
            # Buscar o crear usuario
            user_data = await db.users.find_one({"phone": phone})
            
            if user_data:
                # Usuario existente - actualizar último login
                user = User(**user_data)
                await db.users.update_one(
                    {"phone": phone},
                    {"$set": {"last_login": datetime.now()}}
                )
            else:
                # Nuevo usuario - crear registro
                user = User(phone=phone)
                await db.users.insert_one(user.dict())
            
            return True, user, "Verificación exitosa"
            
        except Exception as e:
            print(f"Error en verify_otp: {e}")
            return False, None, "Error en verificación"
    
    def generate_jwt_token(self, user: User) -> str:
        """Generar JWT token para el usuario"""
        payload = {
            "user_id": user.user_id,
            "phone": user.phone,
            "role": user.role.value,
            "exp": datetime.now() + timedelta(days=30)
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    def verify_jwt_token(self, token: str) -> Optional[dict]:
        """Verificar y decodificar JWT token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Obtener usuario por ID"""
        try:
            db = await self._get_db()  # ← USAR método lazy
            user_data = await db.users.find_one({"user_id": user_id})
            if user_data:
                return User(**user_data)
            return None
        except Exception as e:
            print(f"Error getting user by id: {e}")
            return None

# Instancia global del servicio de autenticación
auth_service = AuthService()