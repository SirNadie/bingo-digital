import { useState, useEffect } from 'react';
import { bingoApi } from '../services/api';

export const useGameState = (gameId) => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (gameId) {
      loadGameState();
      
      // Polling más frecuente para desarrollo
      const interval = setInterval(loadGameState, 2000); // Cada 2 segundos
      
      return () => clearInterval(interval);
    }
  }, [gameId]);

  const loadGameState = async () => {
    try {
      const gameData = await bingoApi.getGame(gameId);
      setGameState(gameData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading game state:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshGameState = () => {
    loadGameState();
  };

  return { gameState, loading, error, refreshGameState };
};