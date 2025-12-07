from typing import Dict, Set
from fastapi import WebSocket
import json


class ConnectionManager:
    """Manages WebSocket connections organized by game rooms."""
    
    def __init__(self):
        # game_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, game_id: str):
        """Accept connection and add to game room."""
        await websocket.accept()
        if game_id not in self.active_connections:
            self.active_connections[game_id] = set()
        self.active_connections[game_id].add(websocket)
    
    def disconnect(self, websocket: WebSocket, game_id: str):
        """Remove connection from game room."""
        if game_id in self.active_connections:
            self.active_connections[game_id].discard(websocket)
            if not self.active_connections[game_id]:
                del self.active_connections[game_id]
    
    async def broadcast_to_game(self, game_id: str, event_type: str, data: dict):
        """Send message to all connections in a game room."""
        message = json.dumps({
            "type": event_type,
            "payload": data
        })
        if game_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[game_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    disconnected.add(connection)
            # Clean up disconnected clients
            for conn in disconnected:
                self.active_connections[game_id].discard(conn)
    
    async def send_personal(self, websocket: WebSocket, event_type: str, data: dict):
        """Send message to a specific connection."""
        message = json.dumps({
            "type": event_type,
            "payload": data
        })
        try:
            await websocket.send_text(message)
        except Exception:
            pass
    
    def get_connection_count(self, game_id: str) -> int:
        """Get number of active connections in a game room."""
        return len(self.active_connections.get(game_id, set()))


# Global instance
manager = ConnectionManager()
