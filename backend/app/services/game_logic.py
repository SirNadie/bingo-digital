from typing import List, Dict, Set
import random

class BingoLogic:
    def generate_bingo_card(self) -> List[List[str]]:
        """Generar un cartón de bingo 5x5 con números únicos por columna"""
        card = []
        ranges = {
            'B': (1, 15),
            'I': (16, 30), 
            'N': (31, 45),
            'G': (46, 60),
            'O': (61, 75)
        }
        
        for i, letter in enumerate("BINGO"):
            numbers = list(range(ranges[letter][0], ranges[letter][1] + 1))
            random.shuffle(numbers)
            column = [f"{letter}{num}" for num in numbers[:5]]
            
            # El centro es libre
            if i == 2:  # Columna N (índice 2)
                column[2] = "🎯"  # Centro libre
            
            card.append(column)
        
        # Transponer para tener filas en lugar de columnas
        return [list(row) for row in zip(*card)]
    
    def check_winning_patterns(self, card: List[List[str]], drawn_numbers: Set[str]) -> Dict[str, bool]:
        """Verificar todos los patrones ganadores"""
        patterns = {
            "linea_horizontal": self._check_horizontal_lines(card, drawn_numbers),
            "linea_vertical": self._check_vertical_lines(card, drawn_numbers),
            "diagonal_principal": self._check_diagonal(card, drawn_numbers, True),
            "diagonal_secundaria": self._check_diagonal(card, drawn_numbers, False),
            "bingo_completo": self._check_full_card(card, drawn_numbers),
            "cuatro_esquinas": self._check_four_corners(card, drawn_numbers)
        }
        
        return patterns
    
    def _check_horizontal_lines(self, card: List[List[str]], drawn_numbers: Set[str]) -> List[int]:
        """Verificar líneas horizontales completas"""
        winning_lines = []
        for i, row in enumerate(card):
            if all(self._is_number_marked(cell, drawn_numbers) for cell in row):
                winning_lines.append(i)
        return winning_lines
    
    def _check_vertical_lines(self, card: List[List[str]], drawn_numbers: Set[str]) -> List[int]:
        """Verificar líneas verticales completas"""
        winning_columns = []
        for j in range(5):
            if all(self._is_number_marked(card[i][j], drawn_numbers) for i in range(5)):
                winning_columns.append(j)
        return winning_columns
    
    def _check_diagonal(self, card: List[List[str]], drawn_numbers: Set[str], main: bool) -> bool:
        """Verificar diagonal principal o secundaria"""
        if main:
            # Diagonal principal: (0,0), (1,1), (2,2), (3,3), (4,4)
            return all(self._is_number_marked(card[i][i], drawn_numbers) for i in range(5))
        else:
            # Diagonal secundaria: (0,4), (1,3), (2,2), (3,1), (4,0)
            return all(self._is_number_marked(card[i][4-i], drawn_numbers) for i in range(5))
    
    def _check_full_card(self, card: List[List[str]], drawn_numbers: Set[str]) -> bool:
        """Verificar cartón completo"""
        return all(
            self._is_number_marked(cell, drawn_numbers) 
            for row in card for cell in row
        )
    
    def _check_four_corners(self, card: List[List[str]], drawn_numbers: Set[str]) -> bool:
        """Verificar cuatro esquinas"""
        corners = [
            card[0][0], card[0][4],  # Esquina superior izquierda y derecha
            card[4][0], card[4][4]   # Esquina inferior izquierda y derecha
        ]
        return all(self._is_number_marked(corner, drawn_numbers) for corner in corners)
    
    def _is_number_marked(self, number: str, drawn_numbers: Set[str]) -> bool:
        """Verificar si un número está marcado (el centro siempre está marcado)"""
        return number == "🎯" or number in drawn_numbers

# Instancia global de la lógica del juego
bingo_logic = BingoLogic()