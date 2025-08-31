import React from 'react';
import '../styles/AdminPanel.css';

const AdminPanel = ({ 
  onDrawNumber, 
  onResetGame, 
  currentNumber, 
  numbers, 
  gameStarted,
  onStartGame 
}) => {
  return (
    <div className="admin-panel">
      <h3>🛠️ Panel de Administración</h3>
      
      <div className="admin-controls">
        {!gameStarted ? (
          <button className="start-game-btn" onClick={onStartGame}>
            🎮 Iniciar Juego
          </button>
        ) : (
          <>
            <button className="draw-number-btn" onClick={onDrawNumber}>
              🎲 Sacar Número
            </button>
            
            <button className="reset-game-btn" onClick={onResetGame}>
              🔄 Reiniciar Juego
            </button>
          </>
        )}
      </div>
      
      <div className="game-info">
        <p>📊 Números sorteados: {numbers.length}/75</p>
        <p>🎯 Último número: {currentNumber || 'Ninguno'}</p>
        
        <div className="numbers-list">
          <h4>Números Sorteados:</h4>
          <div className="numbers-grid">
            {numbers.map((num, index) => (
              <span key={index} className="drawn-number">{num}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;