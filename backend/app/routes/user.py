from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models import DepositRequest, WithdrawalRequest, Transaction, TransactionType
from ..services.transaction_service import transaction_service
from ..middleware.auth import get_current_user
from ..models import User
from datetime import datetime

router = APIRouter(tags=["User Management"])

@router.post("/deposit")
async def deposit_credits(
    request: DepositRequest,
    current_user: User = Depends(get_current_user)
):
    """Depositar créditos en la cuenta del usuario"""
    try:
        # SIMULACIÓN: En producción aquí integrarías con pasarela de pago
        print(f"💳 Depósito simulado para {current_user.phone}:")
        print(f"   Monto: {request.amount} créditos")
        print(f"   Método: {request.payment_method}")
        print("-" * 40)
        
        # Crear transacción de depósito
        transaction = await transaction_service.create_transaction(
            current_user.user_id,
            TransactionType.DEPOSIT,
            request.amount,
            f"Depósito via {request.payment_method}"
        )
        
        # Actualizar créditos del usuario
        from ..database import get_database
        db = get_database()
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$inc": {"credits": request.amount}}
        )
        
        # Obtener nuevo saldo
        updated_user = await db.users.find_one({"user_id": current_user.user_id})
        new_balance = updated_user["credits"] if updated_user else current_user.credits + request.amount
        
        return {
            "success": True,
            "message": f"Depósito de {request.amount} créditos exitoso",
            "new_balance": new_balance,
            "transaction_id": transaction.transaction_id
        }
        
    except Exception as e:
        print(f"Error en depósito: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en depósito: {str(e)}")
    
@router.post("/withdraw")
async def request_withdrawal(
    request: WithdrawalRequest,
    current_user: User = Depends(get_current_user)
):
    """Solicitar retiro de créditos (pendiente de aprobación admin)"""
    try:
        # Verificar saldo suficiente
        if current_user.credits < request.amount:
            raise HTTPException(status_code=400, detail="Saldo insuficiente")
        
        # Verificar monto mínimo
        if request.amount < 10:
            raise HTTPException(status_code=400, detail="Monto mínimo: 10 créditos")
        
        # Crear transacción de retiro (pendiente)
        transaction = await transaction_service.create_transaction(
            current_user.user_id,
            TransactionType.WITHDRAWAL,
            request.amount,
            "Solicitud de retiro - Pendiente de aprobación"
        )
        
        print(f"🏧 Solicitud de retiro de {current_user.phone}:")
        print(f"   Monto: {request.amount} créditos")
        print(f"   Saldo actual: {current_user.credits}")
        print(f"   Transaction ID: {transaction.transaction_id}")
        print("-" * 40)
        
        return {
            "success": True,
            "message": "Solicitud de retiro enviada. Pendiente de aprobación administrativa.",
            "transaction_id": transaction.transaction_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en solicitud de retiro: {str(e)}")

@router.get("/transactions")
async def get_user_transactions(
    current_user: User = Depends(get_current_user),
    limit: int = 20
):
    """Obtener historial de transacciones del usuario"""
    try:
        from ..utils.helpers import serialize_mongo_document  # ← AÑADIR
        
        transactions = await transaction_service.get_user_transactions(
            current_user.user_id, limit
        )
        
        # Convertir modelos Pydantic a dict y serializar
        transactions_dict = [tx.dict() for tx in transactions]
        serialized_transactions = [serialize_mongo_document(tx) for tx in transactions_dict]
        
        return {
            "success": True,
            "transactions": serialized_transactions,  # ← USAR serializados
            "total": len(transactions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo transacciones: {str(e)}")
    
@router.get("/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Obtener perfil completo del usuario"""
    try:
        from ..database import get_database
        db = get_database()
        
        # Obtener estadísticas actualizadas
        user_data = await db.users.find_one({"user_id": current_user.user_id})
        if not user_data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Obtener transacciones recientes
        transactions = await transaction_service.get_user_transactions(
            current_user.user_id, 5
        )
        
        return {
            "success": True,
            "profile": {
                "user_id": user_data["user_id"],
                "phone": user_data["phone"],
                "credits": user_data["credits"],
                "total_won": user_data.get("total_won", 0),
                "total_played": user_data.get("total_played", 0),
                "created_at": user_data["created_at"],
                "last_login": user_data.get("last_login")
            },
            "recent_transactions": [tx.dict() for tx in transactions]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo perfil: {str(e)}")