from datetime import datetime
from ..models import Transaction, TransactionType, TransactionStatus
from ..database import get_database
import random

class TransactionService:
    def __init__(self):
        self.db = None  # ← Inicializar como None
    
    async def _get_db(self):
        """Obtener la base de datos de forma lazy"""
        if self.db is None:
            self.db = get_database()
        return self.db

    async def create_transaction(self, user_id: str, type: TransactionType, 
                           amount: int, description: str) -> Transaction:
        try:
            db = await self._get_db()
            
            # Verificar si la colección existe, sino crearla
            collections = await db.list_collection_names()
            if 'transactions' not in collections:
                print("📋 Creando colección 'transactions'...")
                await db.create_collection("transactions")
                # Crear índices
                await db.transactions.create_index("transaction_id", unique=True)
                await db.transactions.create_index("user_id")
                await db.transactions.create_index("status")
            
            transaction_id = f"tx_{random.randint(10000, 99999)}_{datetime.now().timestamp()}"
            
            transaction = Transaction(
                transaction_id=transaction_id,
                user_id=user_id,
                type=type,
                amount=amount,
                description=description,
                created_at=datetime.now()
            )
            
            await db.transactions.insert_one(transaction.dict())
            print(f"✅ Transacción creada: {transaction_id} para usuario {user_id}")
            return transaction
            
        except Exception as e:
            print(f"❌ Error creando transacción: {e}")
            raise


    async def get_user_transactions(self, user_id: str, limit: int = 50):
        """Obtener historial de transacciones de un usuario"""
        db = await self._get_db()
        
        transactions_cursor = db.transactions.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(limit)
        
        transactions_list = await transactions_cursor.to_list(length=limit)
        
        # Convertir a modelos Pydantic
        transactions = []
        for tx_data in transactions_list:
            try:
                # Asegurar que tenemos un dict limpio
                tx_dict = {k: v for k, v in tx_data.items() if k != '_id'}
                transaction = Transaction(**tx_dict)
                transactions.append(transaction)
            except Exception as e:
                print(f"Error parsing transaction: {e}")
                continue
        
        return transactions


# Instancia global del servicio de transacciones
transaction_service = TransactionService()