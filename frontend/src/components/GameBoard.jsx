import React, { useState, useEffect } from 'react';
import BingoCard from './BingoCard';
import PlayerList from './PlayerList';
import NumberGrid from './NumberGrid';
import { useWebSocket } from '../hooks/useWebSocket';
import { bingoApi } from '../services/api';

const GameBoard = ({ gameId, playerName, playerId, onLeaveGame }) => {
  const [gameState, setGameState] = useState(null);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const { isConnected, onMessage } = useWebSocket(gameId);

  useEffect(() => {
    // Cargar estado inicial del juego
    loadGameState();
    
    // Configurar listeners de WebSocket
    const cleanupFunctions = [
      onMessage('number_drawn', (message) => {
        setDrawnNumbers(prev => [...prev, message.number]);
      }),
      
      onMessage('player_joined', (message) => {
        setPlayers(prev => [...prev, { name: message.player_name }]);
      }),
      
      onMessage('game_started', () => {
        setGameState(prev => ({ ...prev, status: 'active' }));
      }),
      
      onMessage('winner', (message) => {
        setWinner({ name: message.player_name, pattern: message.pattern });
        setGameState(prev => ({ ...prev, status: 'finished' }));
      })
    ];

    return () => cleanupFunctions.forEach(cleanup => cleanup && cleanup());
  }, [gameId, onMessage]);

  const loadGameState = async () => {
    try {
      const gameData = await bingoApi.getGame(gameId);
      setGameState(gameData);
      setDrawnNumbers(gameData.drawn_numbers || []);
      setPlayers(gameData.players || []);
      
      if (gameData.winner) {
        setWinner({ 
          name: gameData.players.find(p => p.player_id === gameData.winner)?.name || 'Unknown',
          pattern: gameData.winning_pattern 
        });
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    }
  };

  const handleNumberClick = (number) => {
    // Aquí se puede implementar la lógica para marcar números manualmente
    console.log('Number clicked:', number);
  };

  if (!gameState) {
    return <div className="loading">Cargando juego...</div>;
  }

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>Partida: {gameState.name}</h2>
        <div className="game-status">
          <span className={`status ${gameState.status}`}>
            {gameState.status === 'waiting' && '🟡 Esperando jugadores'}
            {gameState.status === 'active' && '🟢 Juego en curso'}
            {gameState.status === 'finished' && '🔴 Juego terminado'}
          </span>
          <span className="connection-status">
            {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
          </span>
        </div>
        
        {winner && (
          <div className="winner-banner">
            🎉 ¡{winner.name} ha ganado con {winner.pattern}!
          </div>
        )}
      </div>

      <div className="game-content">
        <div className="left-panel">
          <div className="drawn-numbers-section">
            <h3>Números Sorteados</h3>
            <NumberGrid numbers={drawnNumbers} />
          </div>
          
          <div className="players-section">
            <h3>Jugadores ({players.length})</h3>
            <PlayerList players={players} currentPlayer={playerName} />
          </div>
        </div>

        <div className="center-panel">
          <div className="bingo-card-section">
            <h3>Tu Cartón</h3>
            <BingoCard 
              card={gameState.players.find(p => p.player_id === playerId)?.card || []}
              drawnNumbers={drawnNumbers}
              onNumberClick={handleNumberClick}
            />
          </div>
        </div>

        <div className="right-panel">
          <div className="game-actions">
            <button onClick={onLeaveGame} className="leave-button">
              🚪 Abandonar Partida
            </button>
            
            {gameState.status === 'waiting' && (
              <button 
                onClick={() => bingoApi.startGame(gameId)}
                disabled={players.length < 2}
                className="start-button"
              >
                🚀 Iniciar Juego
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;