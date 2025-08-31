import React from 'react';

const WinnerModal = ({ onClose, onNewGame }) => {
  return (
    <div className="modal-overlay">
      <div className="winner-modal">
        <h2>🎉 ¡BINGO! 🎉</h2>
        <p>¡Felicidades, has ganado!</p>
        <div className="modal-buttons">
          <button onClick={onClose}>Cerrar</button>
          <button onClick={onNewGame}>Nuevo Juego</button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;