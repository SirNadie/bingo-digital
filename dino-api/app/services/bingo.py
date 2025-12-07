import random
from typing import List


def generate_bingo_card() -> List[List[int]]:
    """
    Generate a valid 5x5 bingo card.
    
    Standard bingo card format:
    - Column B: numbers 1-15
    - Column I: numbers 16-30
    - Column N: numbers 31-45 (center is FREE space, represented as 0)
    - Column G: numbers 46-60
    - Column O: numbers 61-75
    
    Returns a 5x5 matrix where each row has 5 numbers.
    """
    ranges = [
        (1, 15),   # B
        (16, 30),  # I
        (31, 45),  # N
        (46, 60),  # G
        (61, 75),  # O
    ]
    
    columns: List[List[int]] = []
    
    for col_idx, (start, end) in enumerate(ranges):
        # Pick 5 unique random numbers from the range
        pool = list(range(start, end + 1))
        random.shuffle(pool)
        col = pool[:5]
        
        # Center cell (row 2, col 2) is FREE space (represented as 0)
        if col_idx == 2:  # N column
            col[2] = 0
        
        columns.append(col)
    
    # Transpose to get rows instead of columns
    # Each row has one number from each column
    card: List[List[int]] = []
    for row_idx in range(5):
        row = [columns[col_idx][row_idx] for col_idx in range(5)]
        card.append(row)
    
    return card


def validate_bingo_card(card: List[List[int]]) -> bool:
    """Validate that a bingo card has correct format."""
    if not isinstance(card, list) or len(card) != 5:
        return False
    
    for row in card:
        if not isinstance(row, list) or len(row) != 5:
            return False
        for val in row:
            if not isinstance(val, int):
                return False
    
    # Check center is FREE (0)
    if card[2][2] != 0:
        return False
    
    # Check column ranges
    ranges = [(1, 15), (16, 30), (31, 45), (46, 60), (61, 75)]
    for col_idx, (start, end) in enumerate(ranges):
        for row_idx in range(5):
            val = card[row_idx][col_idx]
            # Skip FREE space
            if row_idx == 2 and col_idx == 2:
                continue
            if val < start or val > end:
                return False
    
    return True
