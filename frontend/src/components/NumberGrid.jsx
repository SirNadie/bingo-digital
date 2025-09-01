import React from 'react';

const NumberGrid = ({ numbers }) => {
  // Agrupar números por letra
  const groupedNumbers = {
    'B': [],
    'I': [],
    'N': [],
    'G': [],
    'O': []
  };

  numbers.forEach(number => {
    const letter = number.charAt(0);
    if (groupedNumbers[letter]) {
      groupedNumbers[letter].push(number);
    }
  });

  return (
    <div className="number-grid">
      {Object.entries(groupedNumbers).map(([letter, letterNumbers]) => (
        <div key={letter} className="number-group">
          <div className="number-letter">{letter}</div>
          <div className="number-list">
            {letterNumbers.map((number, index) => (
              <div key={index} className="number-item">
                {number.substring(1)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NumberGrid;