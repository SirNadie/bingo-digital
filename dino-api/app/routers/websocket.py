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
    - player_joined: { game_id, sold_tickets }
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
