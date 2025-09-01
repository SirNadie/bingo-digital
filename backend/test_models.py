#!/usr/bin/env python3
"""
Script para probar los modelos de la aplicación Bingo Digital
"""

import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models import User, Transaction, BingoGame, Player, CreateGameRequest, JoinGameRequest, TransactionType
from app.utils.helpers import validate_phone_number, generate_otp_code, can_afford_game, calculate_payout
from datetime import datetime

def test_user_model():
    """Probar modelo User"""
    print("🧪 Probando modelo User...")
    
    # Test 1: Creación básica
    user = User(phone="+1234567890")
    assert user.user_id.startswith("user_")
    assert user.phone == "+1234567890"
    assert user.credits == 0
    assert user.role.value == "user"
    print("   ✅ Creación básica - OK")

    # Test 2: Validación de teléfono
    try:
        User(phone="invalid")
        assert False, "Debería fallar con teléfono inválido"
    except ValueError:
        print("   ✅ Validación de teléfono - OK")

    print("   🎉 Modelo User probado correctamente\n")

def test_transaction_model():
    """Probar modelo Transaction"""
    print("🧪 Probando modelo Transaction...")
    
    user_id = "user_12345"
    
    # Test 1: Transacción de depósito
    deposit = Transaction(
        user_id=user_id,
        type=TransactionType.DEPOSIT,
        amount=100,
        description="Recarga inicial"
    )
    assert deposit.transaction_id.startswith("tx_")
    assert deposit.amount == 100
    assert deposit.status.value == "pending"
    print("   ✅ Transacción de depósito - OK")

    # Test 2: Transacción de retiro
    withdrawal = Transaction(
        user_id=user_id,
        type=TransactionType.WITHDRAWAL,
        amount=50,
        description="Solicitud de retiro"
    )
    assert withdrawal.type.value == "withdrawal"
    print("   ✅ Transacción de retiro - OK")

    print("   🎉 Modelo Transaction probado correctamente\n")

def test_bingo_game_model():
    """Probar modelo BingoGame"""
    print("🧪 Probando modelo BingoGame...")
    
    user_id = "user_12345"
    
    # Test 1: Creación de juego
    game = BingoGame(
        name="Torneo Premium",
        created_by=user_id,
        entry_cost=20
    )
    assert game.game_id.startswith("game_")
    assert game.name == "Torneo Premium"
    assert game.entry_cost == 20
    assert game.status.value == "waiting"
    print("   ✅ Creación de juego - OK")

    # Test 2: Estructura de premios
    assert game.prize_structure["bingo_completo"] == 100
    assert game.prize_structure["cuatro_esquinas"] == 40
    print("   ✅ Estructura de premios - OK")

    print("   🎉 Modelo BingoGame probado correctamente\n")

def test_player_model():
    """Probar modelo Player"""
    print("🧪 Probando modelo Player...")
    
    player = Player(
        user_id="user_12345",
        name="Jugador Ejemplo",
        game_id="game_67890"
    )
    
    assert player.player_id.startswith("player_")
    assert player.user_id == "user_12345"
    assert player.credits_balance == 0
    assert player.continue_playing == False
    print("   ✅ Modelo Player - OK\n")

def test_utils_functions():
    """Probar funciones utilitarias"""
    print("🧪 Probando funciones utilitarias...")
    
    # Test validación de teléfono
    assert validate_phone_number("+1234567890") == True
    assert validate_phone_number("1234567890") == True
    assert validate_phone_number("abc") == False
    print("   ✅ Validación de teléfono - OK")

    # Test generación OTP
    otp = generate_otp_code()
    assert len(otp) == 6
    assert otp.isdigit()
    print("   ✅ Generación OTP - OK")

    # Test cálculo de premios
    prize_structure = {"bingo_completo": 100, "linea": 50}
    assert calculate_payout("bingo_completo", prize_structure) == 100
    assert calculate_payout("linea", prize_structure) == 50
    assert calculate_payout("inexistente", prize_structure) == 0
    print("   ✅ Cálculo de premios - OK")

    # Test verificación de créditos
    assert can_afford_game(100, 10, 3) == True    # 100 >= 30
    assert can_afford_game(20, 10, 3) == False    # 20 < 30
    print("   ✅ Verificación de créditos - OK")

    print("   🎉 Utilidades probadas correctamente\n")

def test_request_models():
    """Probar modelos de request"""
    print("🧪 Probando modelos de request...")
    
    # Test CreateGameRequest
    game_request = CreateGameRequest(name="Mi Juego", entry_cost=15)
    assert game_request.name == "Mi Juego"
    assert game_request.entry_cost == 15
    print("   ✅ CreateGameRequest - OK")

    # Test JoinGameRequest
    join_request = JoinGameRequest(game_id="game_123", user_id="user_456")
    assert join_request.game_id == "game_123"
    assert join_request.user_id == "user_456"
    print("   ✅ JoinGameRequest - OK")

    print("   🎉 Modelos de request probados correctamente\n")

def main():
    """Función principal"""
    print("🎯 Iniciando pruebas de modelos Bingo Digital\n")
    
    try:
        test_user_model()
        test_transaction_model()
        test_bingo_game_model()
        test_player_model()
        test_utils_functions()
        test_request_models()
        
        print("🎉 ¡Todas las pruebas pasaron correctamente!")
        print("📋 Resumen:")
        print("   ✅ Modelo User")
        print("   ✅ Modelo Transaction") 
        print("   ✅ Modelo BingoGame")
        print("   ✅ Modelo Player")
        print("   ✅ Funciones utilitarias")
        print("   ✅ Modelos de request")
        
    except Exception as e:
        print(f"❌ Error en las pruebas: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())