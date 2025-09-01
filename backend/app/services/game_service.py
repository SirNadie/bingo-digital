from app.database import get_database
from app.services.notification import notification_service
from app.services.game_logic import bingo_logic
from app.services.transaction_service import transaction_service  # ← AÑADIR
from app.models import GameStatus, TransactionType  # ← AÑADIR
from datetime import datetime
import random
import asyncio
from typing import Dict, List, Set

class GameService:
    def __init__(self):
        self.db = None
        self.active_games: Dict[str, asyncio.Task] = {}
    
    def _get_db(self):
        if self.db is None:
            self.db = get_database()
        return self.db
    
    async def start_game(self, game_id: str):
        db = self._get_db()
        
        # Primero obtener el juego actual
        game = await db.games.find_one({"game_id": game_id})
        if not game:
            raise ValueError("Juego no encontrado")
        
        # Generar cartones para todos los jugadores
        updated_players = []
        for player in game.get("players", []):
            # Generar múltiples cartones (por ahora 1, luego basado en compra)
            cartons = [bingo_logic.generate_bingo_card() for _ in range(1)]
            
            player["cartons"] = cartons
            player["marked_numbers"] = []
            updated_players.append(player)
            
            # Cobrar entrada al jugador (simulado por ahora)
            entry_cost = game.get("entry_cost", 10)
            try:
                await transaction_service.create_transaction(
                    player["user_id"],
                    TransactionType.GAME_PURCHASE,
                    entry_cost,
                    f"Entrada al juego {game_id}"
                )
                
                # Actualizar créditos del usuario
                await db.users.update_one(
                    {"user_id": player["user_id"]},
                    {"$inc": {"credits": -entry_cost}}
                )
                
            except Exception as e:
                print(f"Error cobrando entrada a jugador {player['user_id']}: {e}")
    
        # Actualizar el juego con los cartones y cambiar estado
        result = await db.games.update_one(
            {"game_id": game_id},
            {"$set": {
                "players": updated_players,
                "status": GameStatus.ACTIVE.value, 
                "started_at": datetime.now(),
                "drawn_numbers": []  # Reiniciar números sorteados
            }}
        )
        
        if result.modified_count == 0:
            raise ValueError("Error al actualizar el juego")
        
        # Notificar que el juego comenzó
        await notification_service.notify_game_started(game_id)
        
        # Iniciar el sorteo de números en segundo plano
        self.active_games[game_id] = asyncio.create_task(
            self._number_draw_loop(game_id)
        )
    
    # ... (el resto del código se mantiene igual, pero actualizar _declare_winner)

    async def _declare_winner(self, game_id: str, player_id: str, player_name: str, pattern: str):
        """Declarar un ganador y procesar premio"""
        db = self._get_db()
        
        # Obtener juego y jugador
        game = await db.games.find_one({"game_id": game_id})
        if not game:
            return
        
        player = next((p for p in game.get("players", []) if p["player_id"] == player_id), None)
        if not player:
            return
        
        # Calcular premio
        prize_amount = game["prize_structure"].get(pattern, 0)
        
        # Actualizar estado del juego y ganador
        await db.games.update_one(
            {"game_id": game_id},
            {"$set": {
                "status": GameStatus.FINISHED.value,
                "winner": player_id,
                "winning_pattern": pattern,
                "ended_at": datetime.now()
            }}
        )
        
        # Dar premio al ganador
        if prize_amount > 0:
            try:
                await transaction_service.create_transaction(
                    player["user_id"],
                    TransactionType.PRIZE,
                    prize_amount,
                    f"Premio por {pattern} en juego {game_id}"
                )
                
                # Actualizar créditos del usuario
                await db.users.update_one(
                    {"user_id": player["user_id"]},
                    {"$inc": {"credits": prize_amount, "total_won": prize_amount}}
                )
                
                # Actualizar estadísticas
                await db.users.update_one(
                    {"user_id": player["user_id"]},
                    {"$inc": {"total_played": 1}}
                )
                
            except Exception as e:
                print(f"Error dando premio a jugador {player['user_id']}: {e}")
        
        # Notificar a todos los jugadores
        await notification_service.notify_winner(game_id, player_name, pattern, prize_amount)
        
        # Detener el sorteo de números
        if game_id in self.active_games:
            self.active_games[game_id].cancel()
            del self.active_games[game_id]

# Instancia global del servicio de juego
game_service = GameService()