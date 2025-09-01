import React from 'react';

const BingoCard = ({ card, drawnNumbers, onNumberClick }) => {
  const isNumberDrawn = (number) => {
    return number === '🎯' || drawnNumbers.includes(number);
  };

  return (
    <div className="bingo-card">
      <div className="bingo-header">
        {['B', 'I', 'N', 'G', 'O'].map(letter => (
          <div key={letter} className="bingo-letter">{letter}</div>
        ))}
      </div>
      
      {card.map((row, rowIndex) => (
        <div key={rowIndex} className="bingo-row">
          {row.map((number, colIndex) => {
            const isDrawn = isNumberDrawn(number);
            const isCenter = rowIndex === 2 && colIndex === 2;
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`bingo-cell ${isDrawn ? 'marked' : ''} ${isCenter ? 'center' : ''}`}
                onClick={() => onNumberClick && onNumberClick(number)}
              >
                {isCenter ? '🎯' : number.replace(/[BINGO]/, '')}
                {isDrawn && !isCenter && <div className="marker">✓</div>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default BingoCard;