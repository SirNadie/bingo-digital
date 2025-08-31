const Game = require('../models/Game');
const BingoCard = require('../models/BingoCard');
const User = require('../models/User');
const BingoGenerator = require('../utils/bingoGenerator');

const gameController = {
  // Crear un nuevo juego
  createGame: async (req, res) => {
    try {
      const { name, prize } = req.body;
      
      if (!name || !prize) {
        return res.status(400).json({ error: 'Nombre y premio son requeridos' });
      }

      const game = await Game.create(name, parseInt(prize));
      res.json({ success: true, game });
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener todos los juegos activos
  getActiveGames: async (req, res) => {
    try {
      const games = await Game.findAllActive();
      res.json({ success: true, games });
    } catch (error) {
      console.error('Error getting games:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Comprar cartón para un juego
  purchaseCard: async (req, res) => {
    try {
      const { gameId } = req.params;
      const userId = req.user.id;
      const cardPrice = 1; // 1 crédito por cartón

      // Verificar si el juego existe y está activo
      const game = await Game.findById(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Juego no encontrado' });
      }

      if (game.status !== 'pending' && game.status !== 'active') {
        return res.status(400).json({ error: 'No se pueden comprar cartones para este juego' });
      }

      // Verificar créditos del usuario
      const user = await User.findById(userId);
      if (user.credits < cardPrice) {
        return res.status(400).json({ error: 'Créditos insuficientes' });
      }

      // Generar cartón
      const cardNumbers = BingoGenerator.generateCard();

      // Crear cartón en la base de datos
      const card = await BingoCard.create(userId, gameId, cardNumbers, cardPrice);

      // Descontar créditos
      await User.updateCredits(userId, user.credits - cardPrice);

      res.json({ 
        success: true, 
        message: 'Cartón comprado exitosamente',
        card,
        newBalance: user.credits - cardPrice
      });

    } catch (error) {
      console.error('Error purchasing card:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener cartones de usuario para un juego
  getUserCards: async (req, res) => {
    try {
      const { gameId } = req.params;
      const userId = req.user.id;

      const cards = await BingoCard.findByUserAndGame(userId, gameId);
      res.json({ success: true, cards });
    } catch (error) {
      console.error('Error getting user cards:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = gameController;