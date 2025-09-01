from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from ..services.auth_service import auth_service

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency para obtener el usuario actual desde el token JWT"""
    token = credentials.credentials
    payload = auth_service.verify_jwt_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    user = await auth_service.get_user_by_id(payload["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return user

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """Dependency para verificar que el usuario está activo"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user

async def require_admin(current_user: dict = Depends(get_current_user)):
    """Dependency para verificar que el usuario es administrador"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Se requieren permisos de administrador")
    return current_user