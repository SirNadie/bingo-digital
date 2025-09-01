import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Crear instancia de axios con configuración básica
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log('Enviando request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('Response recibido:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Error en response:', error);
    
    // Si es error de CORS o red
    if (error.code === 'ERR_NETWORK') {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
    }
    
    // Si el backend respondió con error
    if (error.response) {
      const message = error.response.data?.detail || error.response.data?.message || 'Error del servidor';
      throw new Error(message);
    }
    
    throw new Error('Error de conexión desconocido');
  }
);

export const bingoApi = {
  createGame: async (gameName) => {
    try {
      const response = await api.post('/bingo/create', { name: gameName });
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },

  joinGame: async (gameId, playerName) => {
    try {
      const response = await api.post('/bingo/join', { 
        game_id: gameId, 
        player_name: playerName 
      });
      return response.data;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  },

  listGames: async () => {
    try {
      const response = await api.get('/bingo/list');
      return response.data;
    } catch (error) {
      console.error('Error listing games:', error);
      throw error;
    }
  },

  getGame: async (gameId) => {
    try {
      const response = await api.get(`/bingo/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting game:', error);
      throw error;
    }
  },

  startGame: async (gameId) => {
    try {
      const response = await api.post('/bingo/start', { game_id: gameId });
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  },

  stopGame: async (gameId) => {
    try {
      const response = await api.post(`/bingo/${gameId}/stop`);
      return response.data;
    } catch (error) {
      console.error('Error stopping game:', error);
      throw error;
    }
  },
};

export default api;