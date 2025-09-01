import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bingoApi = {
  // Crear un nuevo juego
  createGame: async (gameName) => {
    const response = await api.post('/bingo/create', { name: gameName });
    return response.data;
  },

  // Unirse a un juego
  joinGame: async (gameId, playerName) => {
    const response = await api.post('/bingo/join', { 
      game_id: gameId, 
      player_name: playerName 
    });
    return response.data;
  },

  // Listar juegos disponibles
  listGames: async () => {
    const response = await api.get('/bingo/list');
    return response.data;
  },

  // Obtener información de un juego
  getGame: async (gameId) => {
    const response = await api.get(`/bingo/${gameId}`);
    return response.data;
  },

  // Iniciar un juego
  startGame: async (gameId) => {
    const response = await api.post('/bingo/start', { game_id: gameId });
    return response.data;
  },

  // Detener un juego
  stopGame: async (gameId) => {
    const response = await api.post(`/bingo/${gameId}/stop`);
    return response.data;
  },
};

export default api;