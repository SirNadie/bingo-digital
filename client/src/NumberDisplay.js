import React from 'react';

const NumberDisplay = ({ currentNumber }) => {
  return (
    <div className="number-display">
      <h2>Último número:</h2>
      <div className="current-number">
        {currentNumber || '--'}
      </div>
    </div>
  );
};

export default NumberDisplay;