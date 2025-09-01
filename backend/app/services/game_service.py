from app.database import get_database
from app.services.notification import notification_service
from app.models import GameStatus
from datetime import datetime
import random
import asyncio
from typing import Dict

class GameService:
    def __init__(self):
        # NO inicializar la base de datos aquí, se hará cuando se necesite
        self.db = None
        self.active_games: Dict[str, asyncio.Task] = {}
    
    def _get_db(self):
        """Obtener la base de datos de forma lazy"""
        if self.db is None:
            self.db = get_database()
        return self.db
    
    async def start_game(self, game_id: str):
        """Iniciar un juego y comenzar el sorteo de números"""
        db = self._get_db()
        
        # Actualizar estado del juego
        await db.games.update_one(
            {"game_id": game_id},
            {"$set": {"status": GameStatus.ACTIVE.value, "started_at": datetime.now()}}
        )
        
        # Notificar que el juego comenzó
        await notification_service.notify_game_started(game_id)
        
        # Iniciar el sorteo de números en segundo plano
        self.active_games[game_id] = asyncio.create_task(
            self._number_draw_loop(game_id)
        )
    
    async def _number_draw_loop(self, game_id: str):
        """Loop principal de sorteo de números"""
        try:
            db = self._get_db()
            
            # Generar todos los números del bingo (B1-B15, I16-I30, N31-N45, G46-G60, O61-O75)
            all_numbers = []
            for letter in "BINGO":
                start_num = 1 if letter == "B" else 16 if letter == "I" else 31 if letter == "N" else 46 if letter == "G" else 61
                for num in range(start_num, start_num + 15):
                    all_numbers.append(f"{letter}{num}")
            
            # Mezclar los números
            random.shuffle(all_numbers)
            
            # Sortear números cada 5 segundos
            for number in all_numbers:
                # Verificar si el juego sigue activo
                game = await db.games.find_one({"game_id": game_id})
                if not game or game.get("status") != GameStatus.ACTIVE.value:
                    break
                
                # Agregar número a la lista de sorteados
                await db.games.update_one(
                    {"game_id": game_id},
                    {"$push": {"drawn_numbers": number}}
                )
                
                # Notificar a todos los jugadores
                await notification_service.notify_number_drawn(game_id, number)
                
                # Verificar si hay ganadores
                await self._check_winner(game_id, number)
                
                # Esperar 5 segundos antes del próximo número
                await asyncio.sleep(5)
                
        except Exception as e:
            print(f"Error en el sorteo del juego {game_id}: {e}")
            await notification_service.notify_error(game_id, f"Error en el juego: {str(e)}")
        finally:
            # Limpiar el juego activo
            if game_id in self.active_games:
                del self.active_games[game_id]
    
    async def _check_winner(self, game_id: str, last_number: str):
        """Verificar si hay ganadores después de sortear un número"""
        # Esta función se implementará completamente en la siguiente fase
        # Por ahora solo es un placeholder
        pass
    
    async def stop_game(self, game_id: str):
        """Detener un juego activo"""
        db = self._get_db()
        
        if game_id in self.active_games:
            self.active_games[game_id].cancel()
            del self.active_games[game_id]
            
            # Actualizar estado del juego
            await db.games.update_one(
                {"game_id": game_id},
                {"$set": {"status": GameStatus.FINISHED.value, "ended_at": datetime.now()}}
            )

# Instancia global del servicio de juego
game_service = GameService()