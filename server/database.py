from typing import Dict
from server.models.bingo import BingoGame

# Simulamos la "base de datos" en memoria
db: Dict[str, BingoGame] = {}
