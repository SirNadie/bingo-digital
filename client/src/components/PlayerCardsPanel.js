import React from 'react';
import './PlayerCardsPanel.css';

const PlayerCardsPanel = ({ userCards, drawnNumbers, onDeclareBingo }) => {
  if (!userCards || userCards.length === 0) {
    return (
      <div className="no-cards-panel">
        <i className="fas fa-ticket-alt"></i>
        <p>No tienes cartones para este juego</p>
      </div>
    );
  }

  const checkCardForBingo = (cardNumbers) => {
    if (!cardNumbers || !Array.isArray(cardNumbers)) return false;
    
    const flatCard = cardNumbers.flat();
    const patterns = [
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19], [20, 21, 22, 23, 24], // Horizontales
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23], [4, 9, 14, 19, 24], // Verticales
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]  // Diagonales
    ];

    return patterns.some(pattern => 
      pattern.every(index => {
        const number = flatCard[index];
        return number === 0 || drawnNumbers.includes(number);
      })
    );
  };

  return (
    <div className="player-cards-panel">
      <h3>🃏 Mis Cartones ({userCards.length})</h3>
      
      <div className="cards-scroll-container">
        {userCards.map((card) => {
          const hasBingo = checkCardForBingo(card.numbers);
          const markedNumbers = drawnNumbers.filter(num => 
            card.numbers.flat().includes(num)
          ).length;

          return (
            <div key={card.id} className={`player-card ${hasBingo ? 'has-bingo' : ''}`}>
              <div className="card-header">
                <span>Cartón #{card.id}</span>
                {hasBingo && <span className="bingo-badge">BINGO!</span>}
              </div>
              
              <div className="mini-bingo-grid">
                {card.numbers.map((row, rowIndex) => (
                  <div key={rowIndex} className="mini-bingo-row">
                    {row.map((number, colIndex) => {
                      const isMarked = number === 0 || drawnNumbers.includes(number);
                      const isCenter = rowIndex === 2 && colIndex === 2;
                      
                      return (
                        <div
                          key={colIndex}
                          className={`mini-bingo-cell ${isMarked ? 'marked' : ''} ${isCenter ? 'free' : ''}`}
                          title={number === 0 ? 'FREE' : `Número ${number}`}
                        >
                          {number === 0 ? '🎁' : number}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              <div className="card-footer">
                <span>{markedNumbers}/24 marcados</span>
                {hasBingo && (
                  <button 
                    onClick={() => onDeclareBingo(card.id)}
                    className="declare-bingo-btn"
                  >
                    🏆 Declarar
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

export default PlayerCardsPanel;