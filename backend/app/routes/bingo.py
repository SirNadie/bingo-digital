from fastapi import APIRouter, HTTPException
from app.database import get_database
from app.models import GameStatus, CreateGameRequest, JoinGameRequest
from bson import ObjectId
from datetime import datetime
import random

router = APIRouter()

# Helper para convertir ObjectId a string
def convert_objectid(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

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
        db = get_database()  # Esto ahora lanzará una excepción si no hay conexión
        
        game = await db.games.find_one({"game_id": join_data.game_id})
        if not game:
            raise HTTPException(status_code=404, detail="Juego no encontrado")
        
        player_id = f"player_{random.randint(1000, 9999)}"
        player = {
            "player_id": player_id,
            "name": join_data.player_name,
            "game_id": join_data.game_id,
            "score": 0,
            "joined_at": datetime.now()
        }
        
        await db.games.update_one(
            {"game_id": join_data.game_id},
            {"$push": {"players": player}}
        )
        
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