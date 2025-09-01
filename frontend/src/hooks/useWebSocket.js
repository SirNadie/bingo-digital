import { useState, useEffect, useCallback } from 'react';
import { BingoWebSocket } from '../services/socket';

export const useWebSocket = (gameId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (gameId) {
      const ws = new BingoWebSocket(gameId);
      setSocket(ws);
      
      // Configurar event listeners
      ws.on('connected', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      });

      ws.on('disconnected', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      // Conectar
      ws.connect();

      // Cleanup
      return () => {
        ws.disconnect();
      };
    }
  }, [gameId]);

  const sendMessage = useCallback((message) => {
    if (socket && isConnected) {
      socket.send(message);
    }
  }, [socket, isConnected]);

  const onMessage = useCallback((messageType, handler) => {
    if (socket) {
      socket.on(messageType, handler);
      return () => socket.off(messageType, handler);
    }
  }, [socket]);

  return { socket, isConnected, sendMessage, onMessage, messages };
};