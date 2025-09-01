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
            # Verificar que la conexión funciona
            await self.client.admin.command('ping')
            print("✅ Conectado a MongoDB correctamente")
            return True
        except Exception as e:
            print(f"❌ Error conectando a MongoDB: {e}")
            self.database = None
            return False
    
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

# Función helper para obtener la base de datos (MODIFICADA)
def get_database():
    return mongodb.get_database()