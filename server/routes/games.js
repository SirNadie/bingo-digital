const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los juegos activos
router.get('/active', async (req, res) => {
  try {
    console.log('Solicitando juegos activos...');
    
    const result = await pool.query(
      'SELECT * FROM games WHERE status IN ($1, $2) ORDER BY created_at DESC',
      ['pending', 'active']
    );
    
    console.log('Juegos encontrados:', result.rows.length);
    res.json({ success: true, games: result.rows });
    
  } catch (error) {
    console.error('Error getting games:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo juego (solo admin)
router.post('/', async (req, res) => {
  try {
    const { name, prize } = req.body;
    const userId = req.user.id;

    // Verificar si el usuario es admin
    const userResult = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Solo administradores pueden crear juegos' });
    }

    if (!name || !prize) {
      return res.status(400).json({ error: 'Nombre y premio son requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO games (name, prize, status) VALUES ($1, $2, $3) RETURNING *',
      [name, parseInt(prize), 'pending']
    );

    res.json({ success: true, game: result.rows[0] });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Comprar cartón para un juego
router.post('/:gameId/purchase-card', async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    const cardPrice = 1; // 1 crédito por cartón

    // Verificar si el juego existe y está activo
    const gameResult = await pool.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    const game = gameResult.rows[0];

    if (game.status !== 'pending' && game.status !== 'active') {
      return res.status(400).json({ error: 'No se pueden comprar cartones para este juego' });
    }

    // Verificar créditos del usuario
    const userResult = await pool.query(
      'SELECT credits FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    if (user.credits < cardPrice) {
      return res.status(400).json({ error: 'Créditos insuficientes' });
    }

    // Generar números aleatorios para el cartón (simulado)
    const generateBingoCard = () => {
      const ranges = [
        { min: 1, max: 15 },   // B
        { min: 16, max: 30 },  // I
        { min: 31, max: 45 },  // N
        { min: 46, max: 60 },  // G
        { min: 61, max: 75 }   // O
      ];

      const card = [];
      
      for (let col = 0; col < 5; col++) {
        const column = [];
        const numbers = new Set();
        
        while (numbers.size < 5) {
          const num = Math.floor(Math.random() * (ranges[col].max - ranges[col].min + 1)) + ranges[col].min;
          numbers.add(num);
        }
        
        column.push(...Array.from(numbers).sort((a, b) => a - b));
        
        // El centro es FREE (0)
        if (col === 2) {
          column[2] = 0;
        }
        
        card.push(column);
      }

      // Transponer para tener filas
      const rows = [];
      for (let i = 0; i < 5; i++) {
        const row = [];
        for (let j = 0; j < 5; j++) {
          row.push(card[j][i]);
        }
        rows.push(row);
      }

      return rows;
    };

    const cardNumbers = generateBingoCard();

    // Crear cartón en la base de datos
    const cardResult = await pool.query(
      'INSERT INTO bingo_cards (user_id, game_id, numbers, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, gameId, cardNumbers, cardPrice]
    );

    // Descontar créditos
    await pool.query(
      'UPDATE users SET credits = credits - $1 WHERE id = $2',
      [cardPrice, userId]
    );

    // Obtener el nuevo balance
    const newBalanceResult = await pool.query(
      'SELECT credits FROM users WHERE id = $1',
      [userId]
    );

    res.json({ 
      success: true, 
      message: 'Cartón comprado exitosamente',
      card: cardResult.rows[0],
      newBalance: newBalanceResult.rows[0].credits
    });

  } catch (error) {
    console.error('Error purchasing card:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener cartones de usuario para un juego específico
router.get('/:gameId/cards', async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM bingo_cards WHERE user_id = $1 AND game_id = $2 ORDER BY purchased_at DESC',
      [userId, gameId]
    );

    res.json({ success: true, cards: result.rows });
  } catch (error) {
    console.error('Error getting user cards:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los cartones del usuario
router.get('/user/cards', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        bc.*, 
        g.name as game_name, 
        g.prize as game_prize,
        g.status as game_status
      FROM bingo_cards bc
      JOIN games g ON bc.game_id = g.id
      WHERE bc.user_id = $1
      ORDER BY bc.purchased_at DESC
    `, [userId]);

    res.json({ success: true, cards: result.rows });
  } catch (error) {
    console.error('Error getting user cards:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener información de un juego específico
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    const result = await pool.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    res.json({ success: true, game: result.rows[0] });
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado de un juego (solo admin)
router.put('/:gameId/status', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Verificar si el usuario es admin
    const userResult = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Solo administradores pueden actualizar juegos' });
    }

    const validStatuses = ['pending', 'active', 'finished', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const result = await pool.query(
      'UPDATE games SET status = $1 WHERE id = $2 RETURNING *',
      [status, gameId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    res.json({ success: true, game: result.rows[0] });
  } catch (error) {
    console.error('Error updating game status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;