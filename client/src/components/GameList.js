import React, { useState, useEffect } from 'react';
import GameItem from './GameItem';
import './GameList.css';

const GameList = ({ user }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      console.log('Token usado:', token);
      
      const response = await fetch('http://localhost:5000/api/games/active', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Juegos recibidos:', data.games);
        setGames(data.games);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || `Error ${response.status}: ${response.statusText}`);
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando juegos...</div>;
  if (error) return (
    <div className="error">
      <p>Error: {error}</p>
      <button onClick={fetchGames} className="btn btn-secondary">
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="game-list">
      <div className="game-list-header">
        <h2>Juegos Disponibles</h2>
        <button onClick={fetchGames} className="btn btn-secondary">
          <i className="fas fa-sync-alt"></i> Actualizar
        </button>
      </div>

      {games.length === 0 ? (
        <div className="no-games">
          <i className="fas fa-calendar-times"></i>
          <h3>No hay juegos disponibles</h3>
          <p>Vuelve más tarde para nuevos sorteos</p>
        </div>
      ) : (
        <div className="games-grid">
          {games.map(game => (
            <GameItem key={game.id} game={game} user={user} onPurchase={fetchGames} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameList;