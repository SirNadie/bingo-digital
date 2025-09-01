import React, { useState } from 'react';
import Home from './components/Home';
import GameBoard from './components/GameBoard';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');

  const handleGameCreated = (newGameId, newPlayerName, gameData) => {
    setGameId(newGameId);
    setPlayerName(newPlayerName);
    setPlayerId(gameData.players.find(p => p.name === newPlayerName)?.player_id || '');
    setCurrentView('game');
  };

  const handleGameJoined = (joinedGameId, joinedPlayerName, result) => {
    setGameId(joinedGameId);
    setPlayerName(joinedPlayerName);
    setPlayerId(result.player_id);
    setCurrentView('game');
  };

  const handleLeaveGame = () => {
    setCurrentView('home');
    setGameId('');
    setPlayerName('');
    setPlayerId('');
  };

  return (
    <div className="app">
      {currentView === 'home' && (
        <Home 
          onGameCreated={handleGameCreated}
          onGameJoined={handleGameJoined}
        />
      )}
      
      {currentView === 'game' && (
        <GameBoard 
          gameId={gameId}
          playerName={playerName}
          playerId={playerId}
          onLeaveGame={handleLeaveGame}
        />
      )}
    </div>
  );
}

export default App;