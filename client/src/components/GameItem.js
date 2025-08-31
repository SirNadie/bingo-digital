import React, { useState } from 'react';
import GameRoom from './GameRoom'; // ✅ Asegúrate de importar GameRoom
import './GameItem.css';

const GameItem = ({ game, user, onPurchase }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showGameRoom, setShowGameRoom] = useState(false); // ✅ Mover dentro del componente

  const handlePurchase = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/games/${game.id}/purchase-card`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Cartón comprado exitosamente');
        if (onPurchase) onPurchase();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Función para unirse al juego
  const handleJoinGame = () => {
    setShowGameRoom(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Próximamente', class: 'status-pending' },
      active: { label: 'En Juego', class: 'status-active' },
      finished: { label: 'Finalizado', class: 'status-finished' }
    };

    const config = statusConfig[status] || { label: status, class: 'status-unknown' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  // ✅ Mostrar GameRoom si showGameRoom es true
  if (showGameRoom) {
    return <GameRoom game={game} user={user} onExit={() => setShowGameRoom(false)} />;
  }

  return (
    <div className="game-item">
      <div className="game-header">
        <h3>{game.name}</h3>
        {getStatusBadge(game.status)}
      </div>

      <div className="game-details">
        <div className="game-prize">
          <i className="fas fa-trophy"></i>
          <span className="prize-amount">{game.prize} créditos</span>
        </div>

        <div className="game-info">
          <div className="info-item">
            <i className="fas fa-users"></i>
            <span>Estado: {game.status}</span>
          </div>
          <div className="info-item">
            <i className="fas fa-calendar"></i>
            <span>{new Date(game.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="game-actions">
        <button
          onClick={handlePurchase}
          disabled={loading || (game.status !== 'pending' && game.status !== 'active')}
          className={`btn ${loading ? 'btn-disabled' : 'btn-primary'}`}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Comprando...
            </>
          ) : (
            <>
              <i className="fas fa-shopping-cart"></i>
              Comprar Cartón (1 crédito)
            </>
          )}
        </button>

        {/* ✅ Botón para unirse al juego */}
        <button
          onClick={handleJoinGame}
          className="btn btn-secondary"
          disabled={game.status !== 'active'}
        >
          <i className="fas fa-door-open"></i>
          Unirse al Juego
        </button>

        {message && (
          <div className={`purchase-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {(game.status !== 'pending' && game.status !== 'active') && (
          <div className="game-disabled">
            No disponible para compra
          </div>
        )}
      </div>
    </div>
  );
};

export default GameItem;