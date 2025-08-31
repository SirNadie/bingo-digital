import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import PlayerCardsPanel from './PlayerCardsPanel';
import './GameRoom.css';

const GameRoom = ({ game, user, onExit }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    status: 'waiting',
    drawnNumbers: [],
    players: 0,
    isPlaying: false
  });
  const [messages, setMessages] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [markedCards, setMarkedCards] = useState([]);

  // Cargar cartones del usuario
  useEffect(() => {
    const fetchUserCards = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/games/${game.id}/cards`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserCards(data.cards);
          // Inicializar marcado
          setMarkedCards(data.cards.map(card => ({
            cardId: card.id,
            markedNumbers: [],
            isBingo: false
          })));
        }
      } catch (error) {
        console.error('Error fetching user cards:', error);
      }
    };

    fetchUserCards();
  }, [game.id]);

  // ✅ SOLO UN useEffect para Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join-game', game.id);

    // Event listeners del socket
    newSocket.on('game-state', (state) => {
      setGameState(prev => ({
        ...prev,
        status: state.status,
        drawnNumbers: state.drawnNumbers,
        players: state.players
      }));
      
      // Actualizar números marcados
      updateMarkedNumbers(state.drawnNumbers);
    });

    newSocket.on('game-started', (data) => {
      setGameState(prev => ({ ...prev, status: 'active' }));
      addMessage('⚡ El juego ha comenzado!', 'system');
    });

    newSocket.on('number-drawn', (data) => {
      setGameState(prev => ({
        ...prev,
        drawnNumbers: [...prev.drawnNumbers, data.number]
      }));
      
      // Marcar el nuevo número en los cartones
      updateMarkedNumbers([...gameState.drawnNumbers, data.number]);
      
      addMessage(`🎲 Número sorteado: ${data.number}`, 'system');
    });

    newSocket.on('bingo-declared', (data) => {
      addMessage('🎉 ¡Alguien declaró BINGO! Esperando validación...', 'system');
    });

    newSocket.on('bingo-validated', (data) => {
      if (data.isValid) {
        addMessage(`🏆 ¡BINGO VALIDADO! ${data.username} ganó ${data.prize} créditos`, 'system');
      } else {
        addMessage('❌ Bingo no válido. El juego continúa', 'system');
      }
    });

    newSocket.on('player-joined', (data) => {
      addMessage(`👤 ${data.username} se unió al juego`, 'system');
    });

    // ✅ Agregar listener para validación de bingo
    newSocket.on('bingo-validation', (data) => {
      if (data.isValid) {
        addMessage('🎉 ¡BINGO VÁLIDO! Has ganado', 'success');
      } else {
        addMessage('❌ BINGO no válido: ' + data.message, 'error');
      }
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [game.id]);

  // Actualizar números marcados
  const updateMarkedNumbers = (drawnNumbers) => {
    setMarkedCards(prev => prev.map(markedCard => {
      const card = userCards.find(c => c.id === markedCard.cardId);
      if (!card) return markedCard;

      const newMarkedNumbers = [];
      let isBingo = false;

      // Verificar cada número del cartón
      if (card.numbers && Array.isArray(card.numbers)) {
        for (let i = 0; i < card.numbers.length; i++) {
          for (let j = 0; j < card.numbers[i].length; j++) {
            const number = card.numbers[i][j];
            if (drawnNumbers.includes(number) || number === 0) { // 0 = FREE
              newMarkedNumbers.push(number);
            }
          }
        }

        // Verificar si hay BINGO
        isBingo = checkForBingo(card.numbers, drawnNumbers);
      }

      return {
        ...markedCard,
        markedNumbers: newMarkedNumbers,
        isBingo: isBingo
      };
    }));
  };

  // Verificar patrones de BINGO
  const checkForBingo = (cardNumbers, drawnNumbers) => {
    if (!cardNumbers || !Array.isArray(cardNumbers)) return false;

    const patterns = [
      // Líneas horizontales
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      
      // Líneas verticales
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      
      // Diagonales
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20]
    ];

    // Convertir matriz 2D a array 1D
    const flatCard = cardNumbers.flat();
    
    for (const pattern of patterns) {
      const isPatternComplete = pattern.every(index => {
        const number = flatCard[index];
        return number === 0 || drawnNumbers.includes(number);
      });
      
      if (isPatternComplete) return true;
    }
    
    return false;
  };

  const addMessage = (text, type = 'system') => {
    setMessages(prev => [...prev, { text, type, timestamp: new Date() }]);
  };

  const handleStartGame = () => {
    if (socket && user.is_admin) {
      socket.emit('start-game', game.id);
    }
  };

  const handleDrawNumber = () => {
    if (socket && user.is_admin) {
      socket.emit('draw-number', game.id);
    }
  };

  const handleDeclareBingo = () => {
    if (socket) {
      // Encontrar el cartón que tiene bingo
      const winningCard = markedCards.find(mc => mc.isBingo);
      
      if (winningCard) {
        // Enviar validación al servidor
        socket.emit('validate-bingo', { 
          gameId: game.id,
          cardId: winningCard.cardId,
          userId: user.id
        });
        
        addMessage('✅ ¡BINGO declarado! Validando...', 'own');
      } else {
        addMessage('❌ Aún no tienes BINGO completo', 'error');
      }
    }
  };

  // Verificar si algún cartón tiene BINGO
  const hasBingo = markedCards.some(mc => mc.isBingo);

  return (
    <div className="game-room">
      <div className="game-room-header">
        <button onClick={onExit} className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i> Volver
        </button>
        <h2>{game.name} - Sala de Juego</h2>
        <div className="game-stats">
          <span>👥 {gameState.players} jugadores</span>
          <span>🎲 {gameState.drawnNumbers.length} números</span>
          <span className={`status ${gameState.status}`}>
            {gameState.status === 'active' ? '🔴 En vivo' : '⏳ Esperando'}
          </span>
          {hasBingo && <span className="status bingo">🎉 ¡TIENES BINGO!</span>}
        </div>
      </div>

      <div className="game-room-content">
        {/* Panel de Números Sorteados */}
        <div className="drawn-numbers-panel">
          <h3>Números Sorteados</h3>
          <div className="numbers-grid">
            {Array.from({ length: 75 }, (_, i) => i + 1).map(number => (
              <div
                key={number}
                className={`number-cell ${
                  gameState.drawnNumbers.includes(number) ? 'drawn' : ''
                }`}
              >
                {number}
              </div>
            ))}
          </div>
        </div>

        {/* Panel de Cartones del Jugador */}
        <PlayerCardsPanel 
          userCards={userCards}
          drawnNumbers={gameState.drawnNumbers}
          onDeclareBingo={handleDeclareBingo}
        />

        {/* Panel de Control y Chat */}
        <div className="game-sidebar">
          {/* Controles de Admin */}
          {user.is_admin && (
            <div className="admin-controls">
              <h4>Controles de Administrador</h4>
              <button
                onClick={handleStartGame}
                disabled={gameState.status === 'active'}
                className="btn btn-primary"
              >
                <i className="fas fa-play"></i> Iniciar Juego
              </button>
              <button
                onClick={handleDrawNumber}
                disabled={gameState.status !== 'active'}
                className="btn btn-secondary"
              >
                <i className="fas fa-dice"></i> Sortear Número
              </button>
            </div>
          )}

          {/* Botón de BINGO */}
          <button
            onClick={handleDeclareBingo}
            disabled={gameState.status !== 'active' || !hasBingo}
            className={`btn ${hasBingo ? 'btn-success' : 'btn-disabled'} bingo-btn`}
          >
            <i className="fas fa-trophy"></i> 
            {hasBingo ? '¡DECLARAR BINGO!' : 'BINGO NO COMPLETO'}
          </button>

          {/* Chat de Juego */}
          <div className="game-chat">
            <h4>Actividad del Juego</h4>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.type}`}>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="message-text">{msg.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;