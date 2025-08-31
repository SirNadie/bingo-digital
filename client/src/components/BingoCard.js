import React from 'react';
import './BingoCard.css';

const BingoCard = ({ card }) => {
  if (!card || !card.numbers) {
    return (
      <div className="bingo-card error">
        <div className="card-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Error al cargar el cartón</p>
        </div>
      </div>
    );
  }

  // Asegurarnos de que numbers sea una matriz 5x5
  const ensure5x5Grid = (numbers) => {
    if (!Array.isArray(numbers)) return Array(5).fill().map(() => Array(5).fill(0));
    
    // Si es un array de arrays, asegurar que tenga 5 filas
    let grid = numbers.slice(0, 5);
    
    // Asegurar que cada fila tenga 5 columnas
    grid = grid.map(row => {
      if (Array.isArray(row)) {
        return row.slice(0, 5);
      }
      return Array(5).fill(0);
    });
    
    // Rellenar si faltan filas
    while (grid.length < 5) {
      grid.push(Array(5).fill(0));
    }
    
    return grid;
  };

  const grid = ensure5x5Grid(card.numbers);

  return (
    <div className="bingo-card">
      <div className="card-header">
        <h4>Cartón #{card.id}</h4>
        <span className="card-game">Juego: {card.game_name || `#${card.game_id}`}</span>
        {card.is_winner && (
          <div className="winner-badge">
            <i className="fas fa-trophy"></i>
            Ganador
          </div>
        )}
      </div>
      
      <div className="bingo-grid">
        <div className="bingo-header">
          {['B', 'I', 'N', 'G', 'O'].map(letter => (
            <div key={letter} className="bingo-letter">{letter}</div>
          ))}
        </div>
        
        <div className="bingo-numbers">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="bingo-row">
              {row.map((number, colIndex) => (
                <div
                  key={colIndex}
                  className={`bingo-cell ${number === 0 ? 'free-space' : ''} ${
                    card.is_winner ? 'winner' : ''
                  }`}
                >
                  {number === 0 ? 'FREE' : number}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="card-footer">
        <div className="card-price">
          <i className="fas fa-coins"></i>
          {card.price} crédito{card.price !== 1 ? 's' : ''}
        </div>
        <div className="card-date">
          {new Date(card.purchased_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default BingoCard;