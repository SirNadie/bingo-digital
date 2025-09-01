import React, { useState } from 'react';

const Home = ({ onGameCreated, onGameJoined }) => {
  const [playerName, setPlayerName] = useState('');

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bienvenido al Bingo Digital</h2>
      <input
        type="text"
        placeholder="Tu nombre"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={() => onGameCreated('test-game', playerName, {})}>
        Crear Partida de Prueba
      </button>
    </div>
  );
};

export default Home;