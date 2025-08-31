import React, { useState, useEffect } from 'react';
import BingoCard from './BingoCard'; // ✅ Ahora sí lo vamos a usar
import './UserCards.css';

const UserCards = ({ user }) => {
  const [cards, setCards] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserCards();
    fetchGames();
  }, []);

  const fetchUserCards = async (gameId = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Endpoint para obtener todos los cartones del usuario
      const response = await fetch('http://localhost:5000/api/user/cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      } else {
        console.log('No se pudieron cargar los cartones');
        setCards([]);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/games/active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  // Filtrar cartones por juego seleccionado
  const filteredCards = selectedGame 
    ? cards.filter(card => card.game_id == selectedGame)
    : cards;

  if (loading) return <div className="loading">Cargando cartones...</div>;

  return (
    <div className="user-cards">
      <div className="user-cards-header">
        <h2>Mis Cartones</h2>
        
        <div className="game-filter">
          <label htmlFor="game-select">Filtrar por juego:</label>
          <select 
            id="game-select"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="">Todos los juegos</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.name} - {game.prize} créditos
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="no-cards">
          <i className="fas fa-ticket-alt"></i>
          <h3>No tienes cartones aún</h3>
          <p>Compra cartones en la pestaña "Juegos Disponibles"</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredCards.map(card => (
            <BingoCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCards;