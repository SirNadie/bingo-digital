#!/usr/bin/env python3
"""
Script para crear usuario administrador inicial
"""

import asyncio
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import mongodb
from app.models import User, UserRole

async def create_admin_user():
    """Crear usuario administrador inicial"""
    try:
        await mongodb.connect()
        db = mongodb.get_database()
        
        # Verificar si ya existe un admin
        existing_admin = await db.users.find_one({"role": UserRole.ADMIN.value})
        if existing_admin:
            print("✅ Ya existe un usuario administrador:")
            print(f"   Phone: {existing_admin['phone']}")
            print(f"   User ID: {existing_admin['user_id']}")
            return
        
        # Crear nuevo admin
        admin_user = User(
            phone="+1234567890",  # Cambiar por tu número de admin
            role=UserRole.ADMIN,
            credits=1000  # Créditos iniciales para admin
        )
        
        await db.users.insert_one(admin_user.dict())
        
        print("🎉 Usuario administrador creado:")
        print(f"   Phone: {admin_user.phone}")
        print(f"   User ID: {admin_user.user_id}")
        print(f"   Credits: {admin_user.credits}")
        print("   🔐 Usa este número para hacer login como administrador")
        
    except Exception as e:
        print(f"❌ Error creando admin: {e}")
    finally:
        await mongodb.disconnect()

if __name__ == "__main__":
    asyncio.run(create_admin_user())