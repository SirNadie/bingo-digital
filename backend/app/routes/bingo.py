from fastapi import APIRouter, HTTPException
from app.database import get_database
from app.models import GameStatus, CreateGameRequest, JoinGameRequest, StartGameRequest
from app.services.notification import notification_service
from app.services.game_service import game_service
from bson import ObjectId
from datetime import datetime
import random

router = APIRouter()

# Helper para convertir ObjectId a string
def convert_objectid(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

# Endpoints
@router.post("/create")
async def create_game(game_data: CreateGameRequest):
    try:
        db = get_database()  # Esto ahora lanzará una excepción si no hay conexión
        
        game_id = f"game_{random.randint(1000, 9999)}"
        
        game = {
            "game_id": game_id,
            "name": game_data.name,
            "status": GameStatus.WAITING.value,
            "players": [],
            "drawn_numbers": [],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        result = await db.games.insert_one(game)
        
        return {
            "message": "Juego creado exitosamente",
            "game_id": game_id,
            "game": convert_objectid(game)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating game: {str(e)}")

@router.post("/join")
async def join_game(join_data: JoinGameRequest):
    try:
        db = get_database()
        
        # Buscar el juego
        game = await db.games.find_one({"game_id": join_data.game_id})
        if not game:
            raise HTTPException(status_code=404, detail="Juego no encontrado")
        
        # Verificar si el jugador ya existe
        existing_player = next((p for p in game.get("players", []) if p["name"] == join_data.player_name), None)
        if existing_player:
            return {
                "message": "Jugador ya existe en la partida",
                "player_id": existing_player["player_id"],
                "game_id": join_data.game_id
            }
        
        # Crear nuevo jugador
        player_id = f"player_{random.randint(1000, 9999)}"
        new_player = {
            "player_id": player_id,
            "name": join_data.player_name,
            "game_id": join_data.game_id,
            "score": 0,
            "joined_at": datetime.now(),
            "card": [],  # Se generará cuando empiece el juego
            "marked_numbers": []
        }
        
        # Añadir jugador al juego - CORREGIDO
        result = await db.games.update_one(
            {"game_id": join_data.game_id},
            {"$push": {"players": new_player}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Error al unir jugador al juego")
        
        return {
            "message": "Jugador unido exitosamente",
            "player_id": player_id,
            "game_id": join_data.game_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error joining game: {str(e)}")
    
@router.get("/list")
async def list_games():
    try:
        db = get_database()  # Esto ahora lanzará una excepción si no hay conexión
        
        games = await db.games.find({"status": GameStatus.WAITING.value}).to_list(100)
        
        return {
            "games": [convert_objectid(game) for game in games]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing games: {str(e)}")

@router.get("/{game_id}")
async def get_game(game_id: str):
    try:
        db = get_database()  # Esto ahora lanzará una excepción si no hay conexión
        
        game = await db.games.find_one({"game_id": game_id})
        if not game:
            raise HTTPException(status_code=404, detail="Juego no encontrado")
        
        return convert_objectid(game)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting game: {str(e)}")
    
@router.post("/start")
async def start_game(start_data: StartGameRequest):
    try:
        db = get_database()
        
        # Verificar que el juego existe
        game = await db.games.find_one({"game_id": start_data.game_id})
        if not game:
            raise HTTPException(status_code=404, detail="Juego no encontrado")
        
        # Verificar que el juego está en estado waiting
        if game.get("status") != GameStatus.WAITING.value:
            raise HTTPException(status_code=400, detail="El juego ya ha comenzado o terminado")
        
        # Verificar que hay al menos 2 jugadores
        players = game.get("players", [])
        if len(players) < 2:
            raise HTTPException(status_code=400, detail="Se necesitan al menos 2 jugadores para comenzar")
        
        # Iniciar el juego
        await game_service.start_game(start_data.game_id)
        
        return {
            "message": "Juego iniciado exitosamente",
            "game_id": start_data.game_id,
            "players_count": len(players)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error iniciando juego: {str(e)}")
    
@router.post("/{game_id}/stop")
async def stop_game(game_id: str):
    try:
        await game_service.stop_game(game_id)
        return {"message": "Juego detenido exitosamente", "game_id": game_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deteniendo juego: {str(e)}")