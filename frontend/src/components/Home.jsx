import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { bingoApi } from '../services/api';

const Home = ({ onGameCreated, onGameJoined }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [gameName, setGameName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const { callApi, loading, error } = useApi();

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!gameName.trim() || !playerName.trim()) return;

    try {
      const result = await callApi(bingoApi.createGame, gameName);
      onGameCreated(result.game_id, playerName, result.game);
    } catch (err) {
      console.error('Error creating game:', err);
    }
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!gameCode.trim() || !playerName.trim()) return;

    try {
      const result = await callApi(bingoApi.joinGame, gameCode, playerName);
      onGameJoined(gameCode, playerName, result);
    } catch (err) {
      console.error('Error joining game:', err);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>🎯 Bingo Digital</h1>
        <p>Juega al bingo en tiempo real con tus amigos</p>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          Crear Partida
        </button>
        <button 
          className={activeTab === 'join' ? 'active' : ''}
          onClick={() => setActiveTab('join')}
        >
          Unirse a Partida
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'create' ? (
        <form onSubmit={handleCreateGame} className="game-form">
          <div className="form-group">
            <label htmlFor="playerName">Tu Nombre:</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gameName">Nombre de la Partida:</label>
            <input
              type="text"
              id="gameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Ej: Bingo Familiar"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Partida'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoinGame} className="game-form">
          <div className="form-group">
            <label htmlFor="joinPlayerName">Tu Nombre:</label>
            <input
              type="text"
              id="joinPlayerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej: María García"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gameCode">Código de Partida:</label>
            <input
              type="text"
              id="gameCode"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              placeholder="Ej: game_1234"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Uniéndose...' : 'Unirse a Partida'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Home;