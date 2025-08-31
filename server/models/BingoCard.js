const pool = require('../config/database');

class BingoCard {
  static async create(userId, gameId, numbers, price) {
    const result = await pool.query(
      'INSERT INTO bingo_cards (user_id, game_id, numbers, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, gameId, numbers, price]
    );
    return result.rows[0];
  }

  static async findByUserAndGame(userId, gameId) {
    const result = await pool.query(
      'SELECT * FROM bingo_cards WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );
    return result.rows;
  }

  static async findByGame(gameId) {
    const result = await pool.query(
      'SELECT * FROM bingo_cards WHERE game_id = $1',
      [gameId]
    );
    return result.rows;
  }

  static async markAsWinner(cardId) {
    const result = await pool.query(
      'UPDATE bingo_cards SET is_winner = true WHERE id = $1 RETURNING *',
      [cardId]
    );
    return result.rows[0];
  }
}

module.exports = BingoCard;