from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ..models import Transaction, TransactionStatus, AdminAdjustmentRequest
from ..services.transaction_service import transaction_service
from ..middleware.auth import require_admin
from ..models import User
from ..database import get_database
from datetime import datetime

router = APIRouter(tags=["Administration"])

@router.get("/users")
async def get_all_users(
    admin: User = Depends(require_admin),
    limit: int = 100,
    skip: int = 0
):
    """Obtener lista de todos los usuarios (solo admin)"""
    try:
        from ..utils.helpers import serialize_mongo_document  # ← AÑADIR
        
        db = get_database()
        
        users_cursor = db.users.find().skip(skip).limit(limit)
        users = await users_cursor.to_list(length=limit)
        total = await db.users.count_documents({})
        
        # Serializar documentos MongoDB
        serialized_users = [serialize_mongo_document(user) for user in users]
        
        return {
            "success": True,
            "users": serialized_users,  # ← USAR serializados
            "total": total,
            "limit": limit,
            "skip": skip
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo usuarios: {str(e)}")
    
@router.get("/transactions")
async def get_all_transactions(
    admin: User = Depends(require_admin),
    status: TransactionStatus = None,
    limit: int = 50,
    skip: int = 0
):
    """Obtener todas las transacciones con filtros (solo admin)"""
    try:
        query = {}
        if status:
            query["status"] = status.value
        
        db = get_database()
        transactions_cursor = db.transactions.find(query).sort("created_at", -1).skip(skip).limit(limit)
        transactions = await transactions_cursor.to_list(length=limit)
        
        total = await db.transactions.count_documents(query)
        
        # Serialización simple - sin dependencias externas
        serialized_transactions = []
        for tx in transactions:
            serialized = tx.copy()
            if '_id' in serialized:
                serialized['_id'] = str(serialized['_id'])
            # Convertir otros campos datetime
            for key, value in serialized.items():
                if isinstance(value, datetime):
                    serialized[key] = value.isoformat()
            serialized_transactions.append(serialized)
        
        return {
            "success": True,
            "transactions": serialized_transactions,
            "total": total,
            "limit": limit,
            "skip": skip
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo transacciones: {str(e)}")
    
@router.post("/transactions/{transaction_id}/approve")
async def approve_withdrawal(
    transaction_id: str,
    admin_notes: str = "",
    admin: User = Depends(require_admin)
):
    """Aprobar una solicitud de retiro (solo admin)"""
    try:
        db = get_database()
        
        # Obtener transacción
        transaction = await db.transactions.find_one({"transaction_id": transaction_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transacción no encontrada")
        
        if transaction["type"] != "withdrawal":
            raise HTTPException(status_code=400, detail="Solo se pueden aprobar retiros")
        
        if transaction["status"] != "pending":
            raise HTTPException(status_code=400, detail="La transacción ya fue procesada")
        
        # Verificar que el usuario tiene saldo suficiente
        user = await db.users.find_one({"user_id": transaction["user_id"]})
        if not user or user["credits"] < transaction["amount"]:
            raise HTTPException(status_code=400, detail="Usuario no tiene saldo suficiente")
        
        # Actualizar créditos del usuario
        await db.users.update_one(
            {"user_id": transaction["user_id"]},
            {"$inc": {"credits": -transaction["amount"]}}
        )
        
        # Marcar transacción como aprobada
        await db.transactions.update_one(
            {"transaction_id": transaction_id},
            {"$set": {
                "status": TransactionStatus.APPROVED.value,
                "processed_at": datetime.now(),
                "admin_notes": admin_notes
            }}
        )
        
        print(f"✅ Retiro aprobado por admin {admin.phone}:")
        print(f"   Transaction: {transaction_id}")
        print(f"   User: {transaction['user_id']}")
        print(f"   Amount: {transaction['amount']}")
        print(f"   Notes: {admin_notes}")
        print("-" * 40)
        
        return {
            "success": True,
            "message": "Retiro aprobado exitosamente",
            "transaction_id": transaction_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error aprobando retiro: {str(e)}")

@router.post("/adjust-credits")
async def adjust_user_credits(
    request: AdminAdjustmentRequest,
    admin: User = Depends(require_admin)
):
    """Ajustar créditos de un usuario manualmente (solo admin)"""
    try:
        db = get_database()
        
        # Verificar que el usuario existe
        user = await db.users.find_one({"user_id": request.user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Crear transacción de ajuste
        transaction_type = "deposit" if request.amount > 0 else "withdrawal"
        transaction = await transaction_service.create_transaction(
            request.user_id,
            TransactionType.DEPOSIT if request.amount > 0 else TransactionType.WITHDRAWAL,
            abs(request.amount),
            f"Ajuste administrativo: {request.reason}"
        )
        
        # Actualizar créditos del usuario
        await db.users.update_one(
            {"user_id": request.user_id},
            {"$inc": {"credits": request.amount}}
        )
        
        # Marcar transacción como aprobada inmediatamente
        await db.transactions.update_one(
            {"transaction_id": transaction.transaction_id},
            {"$set": {
                "status": TransactionStatus.APPROVED.value,
                "processed_at": datetime.now(),
                "admin_notes": request.reason
            }}
        )
        
        print(f"⚙️  Ajuste de créditos por admin {admin.phone}:")
        print(f"   User: {request.user_id}")
        print(f"   Amount: {request.amount}")
        print(f"   Reason: {request.reason}")
        print(f"   Transaction: {transaction.transaction_id}")
        print("-" * 40)
        
        return {
            "success": True,
            "message": f"Créditos ajustados exitosamente: {request.amount}",
            "transaction_id": transaction.transaction_id,
            "new_balance": user["credits"] + request.amount
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ajustando créditos: {str(e)}")

@router.get("/stats")
async def get_system_stats(
    admin: User = Depends(require_admin)
):
    """Obtener estadísticas del sistema (solo admin)"""
    try:
        db = get_database()
        
        total_users = await db.users.count_documents({})
        total_games = await db.games.count_documents({})
        active_games = await db.games.count_documents({"status": "active"})
        
        # Calcular total de créditos en circulación
        pipeline = [{"$group": {"_id": None, "total_credits": {"$sum": "$credits"}}}]
        credits_result = await db.users.aggregate(pipeline).to_list(1)
        total_credits = credits_result[0]["total_credits"] if credits_result else 0
        
        # Transacciones pendientes de aprobación
        pending_withdrawals = await db.transactions.count_documents({
            "type": "withdrawal",
            "status": "pending"
        })
        
        return {
            "success": True,
            "stats": {
                "total_users": total_users,
                "total_games": total_games,
                "active_games": active_games,
                "total_credits": total_credits,
                "pending_withdrawals": pending_withdrawals
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")