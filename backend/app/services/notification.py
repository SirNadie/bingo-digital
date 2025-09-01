from app.routes.websockets import manager
from datetime import datetime

class NotificationService:
    def __init__(self):
        self.manager = None
    
    def _get_manager(self):
        """Obtener el manager de forma lazy"""
        if self.manager is None:
            from app.routes.websockets import manager
            self.manager = manager
        return self.manager
    
    async def notify_player_joined(self, game_id: str, player_name: str):
        """Notificar cuando un jugador se une al juego"""
        manager = self._get_manager()
        await manager.broadcast(game_id, {
            "type": "player_joined",
            "player_name": player_name,
            "timestamp": datetime.now().isoformat(),
            "message": f"{player_name} se ha unido al juego"
        })
    
    async def notify_game_started(self, game_id: str):
        """Notificar cuando el juego comienza"""
        manager = self._get_manager()
        await manager.broadcast(game_id, {
            "type": "game_started",
            "timestamp": datetime.now().isoformat(),
            "message": "¡El juego ha comenzado!"
        })
    
    async def notify_number_drawn(self, game_id: str, number: str):
        """Notificar cuando se sortea un número"""
        manager = self._get_manager()
        await manager.broadcast(game_id, {
            "type": "number_drawn",
            "number": number,
            "timestamp": datetime.now().isoformat(),
            "message": f"Número sorteado: {number}"
        })
    
    async def notify_winner(self, game_id: str, player_name: str, pattern: str):
        """Notificar cuando hay un ganador"""
        manager = self._get_manager()
        await manager.broadcast(game_id, {
            "type": "winner",
            "player_name": player_name,
            "pattern": pattern,
            "timestamp": datetime.now().isoformat(),
            "message": f"🎉 {player_name} ha ganado con {pattern}!"
        })
    
    async def notify_error(self, game_id: str, error_message: str):
        """Notificar errores"""
        manager = self._get_manager()
        await manager.broadcast(game_id, {
            "type": "error",
            "timestamp": datetime.now().isoformat(),
            "message": error_message
        })

# Instancia global del servicio de notificaciones
notification_service = NotificationService()