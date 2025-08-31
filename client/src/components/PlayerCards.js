import React from 'react';
import './PlayerCards.css';

const PlayerCards = ({ cards, markedCards, drawnNumbers, onDeclareBingo }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="no-cards-message">
        <i className="fas fa-ticket-alt"></i>
        <p>No tienes cartones para este juego</p>
      </div>
    );
  }

  return (
    <div className="player-cards">
      <h3>Mis Cartones</h3>
      <div className="cards-container">
        {cards.map((card, index) => {
          const markedCard = markedCards.find(mc => mc.cardId === card.id);
          const isBingo = markedCard?.isBingo || false;
          
          return (
            <div key={card.id} className={`player-card ${isBingo ? 'bingo' : ''}`}>
              <div className="card-header">
                <span>Cartón #{card.id}</span>
                {isBingo && (
                  <span className="bingo-indicator">¡BINGO!</span>
                )}
              </div>
              
              <div className="bingo-grid-small">
                {card.numbers.map((row, rowIndex) => (
                  <div key={rowIndex} className="bingo-row-small">
                    {row.map((number, colIndex) => {
                      const isMarked = number === 0 || drawnNumbers.includes(number);
                      const isCenter = rowIndex === 2 && colIndex === 2;
                      
                      return (
                        <div
                          key={colIndex}
                          className={`bingo-cell-small ${
                            isMarked ? 'marked' : ''
                          } ${isCenter ? 'free' : ''}`}
                        >
                          {number === 0 ? 'FREE' : number}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              <div className="card-stats">
                <span>
                  {markedCard?.markedNumbers.length || 0}/24 marcados
                </span>
                {isBingo && (
                  <button
                    onClick={() => onDeclareBingo(card.id)}
                    className="btn btn-success btn-small"
                  >
                    <i className="fas fa-trophy"></i> Declarar Bingo
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerCards;