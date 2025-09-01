from fastapi import APIRouter, HTTPException, Query
from ..models.bingo import BingoGame, Player
from server.database import db

router = APIRouter()

# Crear un juego
@router.post("/create")
def create_game(name: str = Query(..., description="Nombre del juego")):
    if name in db:
        raise HTTPException(status_code=400, detail="Ya existe un juego con ese nombre")
    game = BingoGame(name=name, players=[])
    db[name] = game
    return {"message": f'Juego "{name}" creado correctamente'}

# Listar juegos
@router.get("/list")
def list_games():
    return list(db.keys())

# Agregar jugador
@router.post("/{game_name}/add-player")
def add_player(game_name: str, player: str = Query(..., description="Nombre del jugador")):
    if game_name not in db:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    game = db[game_name]
    if any(p.name == player for p in game.players):
        raise HTTPException(status_code=400, detail="El jugador ya existe en este juego")
    new_player = Player(name=player)
    game.players.append(new_player)
    return {"message": f'Jugador "{player}" agregado al juego "{game_name}"'}

# Remover jugador
@router.delete("/{game_name}/remove-player")
def remove_player(game_name: str, player: str = Query(..., description="Nombre del jugador")):
    if game_name not in db:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    game = db[game_name]
    for p in game.players:
        if p.name == player:
            game.players.remove(p)
            return {"message": f'Jugador "{player}" eliminado del juego "{game_name}"'}
    raise HTTPException(status_code=404, detail="Jugador no encontrado en este juego")

# Ver estado de un juego
@router.get("/{game_name}")
def get_game(game_name: str):
    if game_name not in db:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    return db[game_name]
