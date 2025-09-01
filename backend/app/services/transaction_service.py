from datetime import datetime
from ..models import Transaction, TransactionType, TransactionStatus
from ..database import get_database
import random

class TransactionService:
    def __init__(self):
        self.db = get_database()

    async def create_transaction(self, user_id: str, type: TransactionType, 
                               amount: int, description: str) -> Transaction:
        transaction_id = f"tx_{random.randint(10000, 99999)}_{datetime.now().timestamp()}"
        
        transaction = Transaction(
            transaction_id=transaction_id,
            user_id=user_id,
            type=type,
            amount=amount,
            description=description,
            created_at=datetime.now()
        )
        
        await self.db.transactions.insert_one(transaction.dict())
        return transaction

    async def get_user_transactions(self, user_id: str, limit: int = 50):
        """Obtener historial de transacciones de un usuario"""
        transactions = await self.db.transactions.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(limit).to_list(None)
        
        return [Transaction(**tx) for tx in transactions]

# Instancia global del servicio de transacciones
transaction_service = TransactionService()