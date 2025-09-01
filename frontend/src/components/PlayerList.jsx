import React from 'react';

const PlayerList = ({ players, currentPlayer }) => {
  return (
    <div className="player-list">
      {players.map((player, index) => (
        <div 
          key={player.player_id || index} 
          className={`player-item ${player.name === currentPlayer ? 'current' : ''}`}
        >
          <span className="player-icon">👤</span>
          <span className="player-name">
            {player.name}
            {player.name === currentPlayer && ' (Tú)'}
          </span>
          {player.score > 0 && (
            <span className="player-score">⭐ {player.score}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayerList;