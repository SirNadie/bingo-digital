import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

class MongoDB:
    def __init__(self):
        self.client = None
        self.database = None
    
    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017"))
            self.database = self.client.bingo_digital
            
            # Crear índices para las nuevas colecciones
            await self._create_indexes()
            
            # Verificar conexión
            await self.client.admin.command('ping')
            print("✅ Conectado a MongoDB correctamente")
            return True
            
        except Exception as e:
            print(f"❌ Error conectando a MongoDB: {e}")
            # Fallback a base de datos mock si es necesario
            try:
                print("🔄 Intentando con base de datos mock...")
                from mongomock_motor import AsyncMongoMockClient
                self.client = AsyncMongoMockClient()
                self.database = self.client.bingo_digital
                return True
            except ImportError:
                print("❌ No se pudo usar mongomock. Instala: pip install mongomock")
                return False
    
    async def _create_indexes(self):
        """Crear índices para optimizar consultas"""
        try:
            # Índices para usuarios
            await self.database.users.create_index("phone", unique=True)
            await self.database.users.create_index("user_id", unique=True)
            
            # Índices para transacciones
            await self.database.transactions.create_index("transaction_id", unique=True)
            await self.database.transactions.create_index("user_id")
            await self.database.transactions.create_index("status")
            
            # Índices para juegos
            await self.database.games.create_index("game_id", unique=True)
            await self.database.games.create_index("status")
            await self.database.games.create_index("created_by")
            
            print("✅ Índices de MongoDB creados correctamente")
            
        except Exception as e:
            print(f"⚠️  Error creando índices: {e}. Continuando sin índices...")
    
    async def disconnect(self):
        if self.client:
            self.client.close()
            print("❌ Desconectado de MongoDB")
    
    def get_database(self):
        """Obtener la base de datos solo si está conectada"""
        if self.database is None:
            raise Exception("Database not connected. Call connect() first.")
        return self.database

# Instancia global de la base de datos
mongodb = MongoDB()

# Función helper para obtener la base de datos
def get_database():
    return mongodb.database

# Helper para convertir ObjectId a string
def convert_objectid(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc