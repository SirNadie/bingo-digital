from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from ..services.auth_service import auth_service
from ..models import LoginRequest, VerifyOTPRequest, User

router = APIRouter(tags=["Authentication"])

@router.post("/login")
async def login(request: LoginRequest):
    """Solicitar código OTP para login"""
    success, message = await auth_service.request_otp(request.phone)
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "message": message,
        "phone": request.phone
    }

@router.post("/verify")
async def verify_otp(request: VerifyOTPRequest):
    """Verificar código OTP y obtener token"""
    success, user, message = await auth_service.verify_otp(request.phone, request.code)
    
    if not success or not user:
        raise HTTPException(status_code=400, detail=message)
    
    # Generar token JWT
    token = auth_service.generate_jwt_token(user)
    
    return {
        "success": True,
        "message": message,
        "token": token,
        "user": {
            "user_id": user.user_id,
            "phone": user.phone,
            "credits": user.credits,
            "role": user.role.value
        }
    }

@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Obtener información del usuario actual"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")
    
    token = authorization.replace("Bearer ", "")
    payload = auth_service.verify_jwt_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    user = await auth_service.get_user_by_id(payload["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {
        "user_id": user.user_id,
        "phone": user.phone,
        "credits": user.credits,
        "role": user.role.value,
        "created_at": user.created_at,
        "last_login": user.last_login
    }

@router.post("/logout")
async def logout():
    """Logout del usuario (el cliente debe eliminar el token)"""
    return {
        "success": True,
        "message": "Sesión cerrada exitosamente"
    }