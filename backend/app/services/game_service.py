from app.database import get_database
from app.services.notification import notification_service
from app.services.game_logic import bingo_logic
from app.models import GameStatus
from datetime import datetime
import random
import asyncio
from typing import Dict, Set, List

class GameService:
    def __init__(self):
        self.db = None
        self.active_games: Dict[str, asyncio.Task] = {}
    
    def _get_db(self):
        if self.db is None:
            self.db = get_database()
        return self.db
    
    async def start_game(self, game_id: str):
        """Iniciar un juego y comenzar el sorteo de números"""
        db = self._get_db()
        
        # Primero obtener el juego actual
        game = await db.games.find_one({"game_id": game_id})
        if not game:
            raise ValueError("Juego no encontrado")
        
        # Generar cartones para todos los jugadores
        updated_players = []
        for player in game.get("players", []):
            player["card"] = bingo_logic.generate_bingo_card()
            player["marked_numbers"] = []
            updated_players.append(player)
        
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
        
        await notification_service.notify_game_started(game_id)
        self.active_games[game_id] = asyncio.create_task(self._number_draw_loop(game_id))
    
    async def _number_draw_loop(self, game_id: str):
        try:
            db = self._get_db()
            all_numbers = self._generate_all_bingo_numbers()
            random.shuffle(all_numbers)
            
            for number in all_numbers:
                game = await db.games.find_one({"game_id": game_id})
                if not game or game.get("status") != GameStatus.ACTIVE.value:
                    break
                
                await db.games.update_one(
                    {"game_id": game_id},
                    {"$push": {"drawn_numbers": number}}
                )
                
                await notification_service.notify_number_drawn(game_id, number)
                await self._check_winner(game_id, number)
                await asyncio.sleep(3)  # 3 segundos entre números
                
        except Exception as e:
            print(f"Error en el sorteo del juego {game_id}: {e}")
            await notification_service.notify_error(game_id, f"Error en el juego: {str(e)}")
        finally:
            if game_id in self.active_games:
                del self.active_games[game_id]
    
    def _generate_all_bingo_numbers(self) -> List[str]:
        """Generar todos los números posibles del bingo"""
        all_numbers = []
        for letter in "BINGO":
            start_num = 1 if letter == "B" else 16 if letter == "I" else 31 if letter == "N" else 46 if letter == "G" else 61
            for num in range(start_num, start_num + 15):
                all_numbers.append(f"{letter}{num}")
        return all_numbers
    
    async def _check_winner(self, game_id: str, last_number: str):
        """Verificar si hay ganadores después de sortear un número"""
        db = self._get_db()
        game = await db.games.find_one({"game_id": game_id})
        if not game:
            return
        
        drawn_numbers_set = set(game.get("drawn_numbers", []))
        
        for player in game.get("players", []):
            card = player.get("card", [])
            patterns = bingo_logic.check_winning_patterns(card, drawn_numbers_set)
            
            # Verificar si algún patrón está completo
            winning_pattern = None
            if patterns["bingo_completo"]:
                winning_pattern = "BINGO COMPLETO"
            elif patterns["diagonal_principal"]:
                winning_pattern = "DIAGONAL PRINCIPAL"
            elif patterns["diagonal_secundaria"]:
                winning_pattern = "DIAGONAL SECUNDARIA"
            elif patterns["linea_horizontal"]:
                winning_pattern = f"LÍNEA HORIZONTAL {patterns['linea_horizontal']}"
            elif patterns["linea_vertical"]:
                winning_pattern = f"LÍNEA VERTICAL {patterns['linea_vertical']}"
            elif patterns["cuatro_esquinas"]:
                winning_pattern = "CUATRO ESQUINAS"
            
            if winning_pattern:
                await self._declare_winner(game_id, player["player_id"], player["name"], winning_pattern)
                break
    
    async def _declare_winner(self, game_id: str, player_id: str, player_name: str, pattern: str):
        """Declarar un ganador y finalizar el juego"""
        db = self._get_db()
        
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
        
        # Notificar a todos los jugadores
        await notification_service.notify_winner(game_id, player_name, pattern)
        
        # Detener el sorteo de números
        if game_id in self.active_games:
            self.active_games[game_id].cancel()
            del self.active_games[game_id]

# Instancia global del servicio de juego
game_service = GameService()