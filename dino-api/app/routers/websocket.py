from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlmodel import Session, select
from app.core.websocket import manager
from app.core.database import get_session
from app.core.security import decode_token, TokenError
from app.models.game import Game as GameModel
import json

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/games/{game_id}")
async def game_websocket(websocket: WebSocket, game_id: str):
    """
    WebSocket endpoint for real-time game updates.
    
    Connect: ws://host/ws/games/{game_id}?token={jwt_token}
    
    Events sent to client:
    - game_started: { game_id, status }
    - number_drawn: { number, drawn_numbers, paid_diagonal, paid_line, paid_bingo }
    - winner: { ticket_id, user_id, amount, category }
    - game_finished: { game_id, status }
    - error: { message }
    """
    # Optional token auth from query params
    token = websocket.query_params.get("token")
    user_id = None
    if token:
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
        except TokenError:
            pass
    
    await manager.connect(websocket, game_id)
    
    # Send initial connection confirmation
    await manager.send_personal(websocket, "connected", {
        "game_id": game_id,
        "user_id": user_id,
        "connections": manager.get_connection_count(game_id)
    })
    
    try:
        while True:
            # Keep connection alive, handle client messages if needed
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get("type", "")
                
                # Handle ping/pong for keepalive
                if msg_type == "ping":
                    await manager.send_personal(websocket, "pong", {})
                
                # Future: handle other client messages like chat
                    
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, game_id)


# Admin connections manager (separate from game rooms)
class AdminConnectionManager:
    """Manages WebSocket connections for admin users."""
    
    def __init__(self):
        self.active_connections: set = set()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
    
    async def broadcast(self, event_type: str, data: dict):
        import json
        message = json.dumps({
            "type": event_type,
            "payload": data
        })
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.add(connection)
        for conn in disconnected:
            self.active_connections.discard(conn)

admin_manager = AdminConnectionManager()


@router.websocket("/ws/admin")
async def admin_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time admin notifications.
    
    Connect: ws://host/ws/admin?token={jwt_admin_token}
    
    Events sent to client:
    - new_transaction: { id, user, type, amount, status }
    - transaction_approved: { id }
    - transaction_rejected: { id }
    - new_user: { id, alias, email }
    - game_created: { id, name, host }
    - stats_updated: { ... }
    """
    # Verify admin token
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Token required")
        return
    
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        is_admin = payload.get("is_admin", False)
        # Check either 'role' (legacy/future) or 'is_admin'
        role = payload.get("role", "")
        
        if not is_admin and role != "admin":
            await websocket.close(code=4003, reason="Admin access required")
            return
    except TokenError:
        await websocket.close(code=4002, reason="Invalid token")
        return
    
    await admin_manager.connect(websocket)
    
    # Send connection confirmation
    await websocket.send_text(json.dumps({
        "type": "connected",
        "payload": {"user_id": user_id, "role": "admin"}
    }))
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get("type", "")
                if msg_type == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "payload": {}}))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        admin_manager.disconnect(websocket)
