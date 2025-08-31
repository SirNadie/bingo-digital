const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const pool = require('./config/database');

// ✅ IMPORTAR MODELOS
const Game = require('./models/Game');

// ✅ IMPORTAR RUTAS
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// ✅ USAR RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

// ✅ Ruta de prueba básica
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend funcionando correctamente!' });
});

// ✅ Socket.IO - Juego en tiempo real
const activeGames = new Map();

// Función para verificar patrones de BINGO (FUERA de io.on)
function checkBingoPatterns(cardNumbers, drawnNumbers) {
  if (!cardNumbers || !Array.isArray(cardNumbers)) return false;

  // Asegurarse de que drawnNumbers es un array
  const drawn = Array.isArray(drawnNumbers) ? drawnNumbers : [];

  const patterns = [
    // Líneas horizontales (filas)
    [0, 1, 2, 3, 4],      // Fila 1
    [5, 6, 7, 8, 9],      // Fila 2  
    [10, 11, 12, 13, 14], // Fila 3
    [15, 16, 17, 18, 19], // Fila 4
    [20, 21, 22, 23, 24], // Fila 5

    // Líneas verticales (columnas)
    [0, 5, 10, 15, 20],   // Col B
    [1, 6, 11, 16, 21],   // Col I
    [2, 7, 12, 17, 22],   // Col N
    [3, 8, 13, 18, 23],   // Col G
    [4, 9, 14, 19, 24],   // Col O

    // Diagonales
    [0, 6, 12, 18, 24],   // Diagonal \
    [4, 8, 12, 16, 20],   // Diagonal /

    // Cuatro esquinas
    [0, 4, 20, 24],

    // Patrón X (esquinas + centro)
    [0, 4, 12, 20, 24]
  ];

  // Convertir matriz 2D a array 1D
  const flatCard = cardNumbers.flat();
  
  for (const pattern of patterns) {
    const isPatternComplete = pattern.every(index => {
      const number = flatCard[index];
      return number === 0 || drawn.includes(number);
    });
    
    if (isPatternComplete) return true;
  }
  
  return false;
}

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Unirse a una sala de juego
  socket.on('join-game', async (gameId) => {
    socket.join(`game-${gameId}`);
    console.log(`Usuario ${socket.id} se unió al juego ${gameId}`);
    
    // Enviar estado actual del juego al nuevo jugador
    try {
      const game = await Game.findById(gameId);
      if (game) {
        socket.emit('game-state', {
          gameId: game.id,
          status: game.status,
          drawnNumbers: game.drawn_numbers || [],
          players: Array.from(activeGames.get(gameId)?.players || []).length
        });
      }
    } catch (error) {
      console.error('Error sending game state:', error);
    }
  });

  // Iniciar un juego (solo admin)
  socket.on('start-game', async (gameId) => {
    try {
      const game = await Game.updateStatus(gameId, 'active');
      io.to(`game-${gameId}`).emit('game-started', {
        gameId: game.id,
        startedAt: new Date()
      });
      console.log(`Juego ${gameId} iniciado`);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  });

  // Sortear un número
  socket.on('draw-number', async (gameId) => {
    try {
      const drawnNumbers = await Game.getDrawnNumbers(gameId);
      const availableNumbers = Array.from({length: 75}, (_, i) => i + 1)
        .filter(num => !drawnNumbers.includes(num));
      
      if (availableNumbers.length === 0) {
        socket.emit('game-error', { message: 'Todos los números ya han sido sorteados' });
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const drawnNumber = availableNumbers[randomIndex];

      // Guardar número sorteado
      await Game.addDrawnNumber(gameId, drawnNumber);
      
      // Notificar a todos los jugadores
      io.to(`game-${gameId}`).emit('number-drawn', {
        number: drawnNumber,
        totalDrawn: drawnNumbers.length + 1,
        gameId: gameId
      });

      console.log(`Número ${drawnNumber} sorteado en juego ${gameId}`);

    } catch (error) {
      console.error('Error drawing number:', error);
      socket.emit('game-error', { message: 'Error al sortear número' });
    }
  });

  // Jugador declara BINGO
  socket.on('declare-bingo', async (data) => {
    try {
      const { gameId, cardId, userId } = data;
      
      // Notificar a todos que alguien declaró bingo
      io.to(`game-${gameId}`).emit('bingo-declared', {
        playerId: socket.id,
        gameId: gameId,
        timestamp: new Date()
      });

      console.log(`Jugador ${socket.id} declaró BINGO en juego ${gameId}`);

    } catch (error) {
      console.error('Error declaring bingo:', error);
    }
  });

  // ✅ VALIDAR BINGO (evento SEPARADO)
  socket.on('validate-bingo', async (data) => {
    try {
      const { gameId, cardId, userId } = data;
      console.log(`🔍 Validando BINGO: juego=${gameId}, cartón=${cardId}, usuario=${userId}`);

      // Obtener cartón y números sorteados
      const [cardResult, gameResult, userResult] = await Promise.all([
        pool.query('SELECT * FROM bingo_cards WHERE id = $1', [cardId]),
        pool.query('SELECT drawn_numbers, prize FROM games WHERE id = $1', [gameId]),
        pool.query('SELECT username FROM users WHERE id = $1', [userId])
      ]);

      if (cardResult.rows.length === 0 || gameResult.rows.length === 0) {
        socket.emit('bingo-validation', { 
          isValid: false, 
          message: 'Datos no encontrados' 
        });
        return;
      }

      const card = cardResult.rows[0];
      const game = gameResult.rows[0];
      const user = userResult.rows[0];
      const drawnNumbers = game.drawn_numbers || [];

      // Verificar patrones de BINGO
      const isValidBingo = checkBingoPatterns(card.numbers, drawnNumbers);

      if (isValidBingo) {
        console.log(`🎉 BINGO VÁLIDO! Usuario ${user.username} ganó ${game.prize} créditos`);

        // Marcar como ganador y dar premio
        await Promise.all([
          pool.query('UPDATE bingo_cards SET is_winner = true WHERE id = $1', [cardId]),
          pool.query('UPDATE games SET status = $1, end_time = NOW() WHERE id = $2', ['finished', gameId]),
          pool.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [game.prize, userId])
        ]);

        // Registrar transacción
        await pool.query(
          'INSERT INTO transactions (user_id, type, amount, status, method) VALUES ($1, $2, $3, $4, $5)',
          [userId, 'win', game.prize, 'completed', 'game_prize']
        );

        // Notificar a TODOS los jugadores
        io.to(`game-${gameId}`).emit('bingo-validated', {
          isValid: true,
          username: user.username,
          prize: game.prize,
          message: `¡${user.username} ganó ${game.prize} créditos!`,
          gameFinished: true
        });

      } else {
        console.log('❌ BINGO no válido');
        socket.emit('bingo-validation', { 
          isValid: false, 
          message: 'Bingo no válido. Patrón incompleto.' 
        });
      }

    } catch (error) {
      console.error('Error validating bingo:', error);
      socket.emit('bingo-validation', { 
        isValid: false, 
        message: 'Error en validación' 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});