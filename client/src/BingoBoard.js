import React, { useState, useEffect } from 'react';

const BingoBoard = ({ numbers, onWinner, checkWinner }) => {
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [boardNumbers] = useState(generateBoard());

  function generateBoard() {
    const board = [];
    const usedNumbers = new Set();
    
    // Llena el tablero con números únicos (1-75)
    for (let i = 0; i < 24; i++) {
      let number;
      do {
        number = Math.floor(Math.random() * 75) + 1;
      } while (usedNumbers.has(number));
      
      usedNumbers.add(number);
      board.push(number);
    }
    
    // Inserta el espacio FREE en el centro (posición 12)
    board.splice(12, 0, 'FREE');
    return board;
  }

  useEffect(() => {
    // Marca números cuando salen
    const newMarked = [...markedNumbers];
    let changed = false;

    numbers.forEach(num => {
      if (!newMarked.includes(num)) {
        newMarked.push(num);
        changed = true;
      }
    });

    if (changed) {
      setMarkedNumbers(newMarked);
    }
  }, [numbers]);

  useEffect(() => {
    // Verifica si hay ganador
    if (checkWinner(markedNumbers)) {
      onWinner();
    }
  }, [markedNumbers, checkWinner, onWinner]);

  return (
    <div className="bingo-board">
      {boardNumbers.map((number, index) => (
        <div
          key={index}
          className={`bingo-cell ${markedNumbers.includes(number) || number === 'FREE' ? 'marked' : ''}`}
        >
          {number}
        </div>
      ))}
    </div>
  );
};

export default BingoBoard;