import React, { useState, useEffect } from 'react';
import BingoCard from './BingoCard';
import PlayerList from './PlayerList';
import NumberGrid from './NumberGrid';
import { useWebSocket } from '../hooks/useWebSocket';
import { useGameState } from '../hooks/useGameState';
import { bingoApi } from '../services/api';

const GameBoard = ({ gameId, playerName, playerId, onLeaveGame }) => {
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [winner, setWinner] = useState(null);
  const { gameState, loading, error, refreshGameState } = useGameState(gameId);
  const { isConnected, onMessage } = useWebSocket(gameId);

  useEffect(() => {
    if (gameState) {
      setDrawnNumbers(gameState.drawn_numbers || []);
      
      if (gameState.winner) {
        const winnerPlayer = gameState.players.find(p => p.player_id === gameState.winner);
        setWinner({
          name: winnerPlayer?.name || 'Jugador Desconocido',
          pattern: gameState.winning_pattern
        });
      }
    }
  }, [gameState]);

  useEffect(() => {
    // Configurar listeners de WebSocket
    const cleanupNumberDrawn = onMessage('number_drawn', (message) => {
      setDrawnNumbers(prev => [...prev, message.number]);
      refreshGameState();
    });

    const cleanupGameStarted = onMessage('game_started', () => {
      refreshGameState();
    });

    const cleanupWinner = onMessage('winner', (message) => {
      setWinner({ name: message.player_name, pattern: message.pattern });
      refreshGameState();
    });

    const cleanupPlayerJoined = onMessage('player_joined', () => {
      refreshGameState();
    });

    return () => {
      cleanupNumberDrawn && cleanupNumberDrawn();
      cleanupGameStarted && cleanupGameStarted();
      cleanupWinner && cleanupWinner();
      cleanupPlayerJoined && cleanupPlayerJoined();
    };
  }, [onMessage, refreshGameState]);

  const handleStartGame = async () => {
    try {
      await bingoApi.startGame(gameId);
      refreshGameState();
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Error al iniciar el juego: ' + error.message);
    }
  };

  const handleNumberClick = (number) => {
    console.log('Number clicked:', number);
    // Aquí se puede agregar lógica para marcar números manualmente
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner">⏳</div>
        <p>Cargando juego...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={onLeaveGame}>Volver al Inicio</button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="error-container">
        <h2>Juego no encontrado</h2>
        <button onClick={onLeaveGame}>Volver al Inicio</button>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.player_id === playerId);
  const playerCard = currentPlayer?.card || [];

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>🎯 {gameState.name}</h2>
        
        <div className="game-info">
          <span className={`status-indicator ${gameState.status}`}>
            {gameState.status === 'waiting' && '🟡 Esperando jugadores'}
            {gameState.status === 'active' && '🟢 Juego en curso'}
            {gameState.status === 'finished' && '🔴 Juego terminado'}
          </span>
          
          <span className="connection-status">
            {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
          </span>

          <span className="player-count">
            👥 {gameState.players.length} jugadores
          </span>
        </div>

        {winner && (
          <div className="winner-banner">
            🏆 ¡{winner.name} ha ganado con {winner.pattern}!
          </div>
        )}
      </div>

      <div className="game-content">
        <div className="left-panel">
          <div className="panel-section">
            <h3>Números Sorteados ({drawnNumbers.length})</h3>
            <NumberGrid numbers={drawnNumbers} />
          </div>
        </div>

        <div className="center-panel">
          <div className="panel-section">
            <h3>Tu Cartón de Bingo</h3>
            <BingoCard 
              card={playerCard}
              drawnNumbers={drawnNumbers}
              onNumberClick={handleNumberClick}
            />
            
            {gameState.status === 'waiting' && (
              <div className="game-actions">
                <button 
                  onClick={handleStartGame}
                  disabled={gameState.players.length < 2}
                  className="start-button"
                >
                  🚀 Iniciar Juego
                </button>
                <p className="help-text">
                  Se necesitan al menos 2 jugadores para comenzar
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="right-panel">
          // En el return del GameBoard, modificar la sección de jugadores:
<div className="panel-section">
  <h3>Jugadores ({gameState.players.length}/2)</h3>
  <PlayerList 
    players={gameState.players} 
    currentPlayer={playerName}
  />
  
  {gameState.status === 'waiting' && (
    <div className="players-warning">
      <p>
        {gameState.players.length < 2 
          ? `Esperando ${2 - gameState.players.length} jugador(es) más...`
          : '¡Listo para comenzar!'
        }
      </p>
      {gameState.players.length >= 2 && (
        <button 
          onClick={handleStartGame}
          className="start-button"
        >
          🚀 Iniciar Juego
        </button>
      )}
    </div>
  )}
</div>

          <div className="panel-section">
            <h3>Acciones</h3>
            <button onClick={onLeaveGame} className="leave-button">
              🚪 Abandonar Partida
            </button>
            
            <div className="game-info-card">
              <h4>Información del Juego</h4>
              <p>ID: {gameState.game_id}</p>
              <p>Estado: {gameState.status}</p>
              <p>Creado: {new Date(gameState.created_at).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;