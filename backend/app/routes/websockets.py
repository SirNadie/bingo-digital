from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Diccionario para almacenar conexiones por game_id
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, game_id: str):
        await websocket.accept()
        
        if game_id not in self.active_connections:
            self.active_connections[game_id] = []
        
        self.active_connections[game_id].append(websocket)
        print(f"✅ Jugador conectado al juego {game_id}. Conexiones: {len(self.active_connections[game_id])}")
    
    def disconnect(self, websocket: WebSocket, game_id: str):
        if game_id in self.active_connections:
            self.active_connections[game_id].remove(websocket)
            if not self.active_connections[game_id]:
                del self.active_connections[game_id]
            print(f"❌ Jugador desconectado del juego {game_id}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)
    
    async def broadcast(self, game_id: str, message: dict):
        if game_id in self.active_connections:
            for connection in self.active_connections[game_id]:
                try:
                    await connection.send_json(message)
                except:
                    self.disconnect(connection, game_id)

# Instancia global del manager
manager = ConnectionManager()

@router.websocket("/game/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):
    await manager.connect(websocket, game_id)
    
    try:
        while True:
            # Esperar mensajes del cliente (pueden usarse para acciones específicas)
            data = await websocket.receive_text()
            print(f"Mensaje recibido del juego {game_id}: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, game_id)
        # Notificar a otros jugadores que alguien se desconectó
        await manager.broadcast(game_id, {
            "type": "player_disconnected",
            "message": "Un jugador ha abandonado la partida"
        })