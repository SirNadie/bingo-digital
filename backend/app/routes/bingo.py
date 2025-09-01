from fastapi import APIRouter, HTTPException, Depends
from app.database import get_database
from app.models import GameStatus, CreateGameRequest, JoinGameRequest, StartGameRequest
from app.services.notification import notification_service
from app.services.game_service import game_service
from app.middleware.auth import get_current_user  # ← AÑADIR
from app.models import User  # ← AÑADIR
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
async def create_game(
    game_data: CreateGameRequest, 
    current_user: User = Depends(get_current_user)  # ← AÑADIR dependencia
):
    try:
        db = get_database()
        
        # Usar el user_id del usuario autenticado
        game_id = f"game_{random.randint(1000, 9999)}"
        
        game = {
            "game_id": game_id,
            "name": game_data.name,
            "status": GameStatus.WAITING.value,
            "players": [],
            "drawn_numbers": [],
            "entry_cost": game_data.entry_cost or 10,
            "prize_structure": game_data.prize_structure or {
                "bingo_completo": 100,
                "diagonal_principal": 50,
                "diagonal_secundaria": 50, 
                "linea_horizontal": 50,
                "linea_vertical": 50,
                "cuatro_esquinas": 40
            },
            "created_by": current_user.user_id,  # ← Usar user_id del usuario autenticado
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
async def join_game(
    join_data: JoinGameRequest,
    current_user: User = Depends(get_current_user)  # ← AÑADIR dependencia
):
    try:
        db = get_database()
        
        # Verificar que el usuario tiene créditos suficientes
        user_data = await db.users.find_one({"user_id": current_user.user_id})
        if not user_data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        game = await db.games.find_one({"game_id": join_data.game_id})
        if not game:
            raise HTTPException(status_code=404, detail="Juego no encontrado")
        
        # Calcular costo total
        cartons_count = join_data.cartons_count or 1
        total_cost = game.get("entry_cost", 10) * cartons_count
        
        if user_data.get("credits", 0) < total_cost:
            raise HTTPException(
                status_code=400, 
                detail=f"Créditos insuficientes. Necesitas {total_cost} créditos"
            )
        
        # Verificar si el usuario ya está en el juego
        existing_player = next(
            (p for p in game.get("players", []) if p["user_id"] == current_user.user_id), 
            None
        )
        
        if existing_player:
            return {
                "message": "Ya estás unido a este juego",
                "player_id": existing_player["player_id"],
                "game_id": join_data.game_id
            }
        
        # Crear nuevo jugador
        player_id = f"player_{random.randint(1000, 9999)}"
        player = {
            "user_id": current_user.user_id,
            "player_id": player_id,
            "name": f"Usuario_{current_user.user_id[-4:]}",  # Nombre temporal
            "game_id": join_data.game_id,
            "score": 0,
            "credits_balance": user_data.get("credits", 0),
            "cartons": [],  # Se generarán al iniciar el juego
            "marked_numbers": [],
            "continue_playing": False,
            "patterns_won": [],
            "joined_at": datetime.now()
        }
        
        # Añadir jugador al juego
        result = await db.games.update_one(
            {"game_id": join_data.game_id},
            {"$push": {"players": player}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Error al unir jugador al juego")
        
        return {
            "message": "Jugador unido exitosamente",
            "player_id": player_id,
            "game_id": join_data.game_id,
            "cartons_count": cartons_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error joining game: {str(e)}")

@router.get("/list")
async def list_games():
    try:
        db = get_database()
        
        games = await db.games.find({"status": GameStatus.WAITING.value}).to_list(100)
        
        return {
            "games": [convert_objectid(game) for game in games]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing games: {str(e)}")

@router.get("/{game_id}")
async def get_game(game_id: str):
    try:
        db = get_database()
        
        game = await db.games.find_one({"game_id": game_id})
        if not game:
            raise HTTPException(status_code=404, detail="Juego no encontrado")
        
        return convert_objectid(game)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting game: {str(e)}")

@router.post("/start")
async def start_game(
    start_data: StartGameRequest,
    current_user: User = Depends(get_current_user)  # ← AÑADIR dependencia
):
    try:
        db = get_database()
        
        # Verificar que el juego existe
        game = await db.games.find_one({"game_id": start_data.game_id})
        if not game:
            raise HTTPException(status_code=404, detail="Juego no encontrado")
        
        # Verificar que el usuario es el creador del juego
        if game.get("created_by") != current_user.user_id:
            raise HTTPException(status_code=403, detail="Solo el creador puede iniciar el juego")
        
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
async def stop_game(
    game_id: str,
    current_user: User = Depends(get_current_user)  # ← AÑADIR dependencia
):
    try:
        # Verificar permisos (solo admin o creador puede detener)
        db = get_database()
        game = await db.games.find_one({"game_id": game_id})
        
        if not game:
            raise HTTPException(status_code=404, detail="Juego no encontrado")
        
        # Solo el creador o un admin puede detener el juego
        if (game.get("created_by") != current_user.user_id and 
            current_user.role != "admin"):
            raise HTTPException(status_code=403, detail="No tienes permisos para detener este juego")
        
        await game_service.stop_game(game_id)
        return {"message": "Juego detenido exitosamente", "game_id": game_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deteniendo juego: {str(e)}")