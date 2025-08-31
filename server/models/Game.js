const pool = require('../config/database');

class Game {
  static async create(name, prize) {
    try {
      const result = await pool.query(
        'INSERT INTO games (name, prize, status) VALUES ($1, $2, $3) RETURNING *',
        [name, prize, 'pending']
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM games WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding game by ID:', error);
      throw error;
    }
  }

  static async findAllActive() {
    try {
      const result = await pool.query(
        'SELECT * FROM games WHERE status IN ($1, $2) ORDER BY created_at DESC',
        ['pending', 'active']
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding active games:', error);
      throw error;
    }
  }

  static async updateStatus(gameId, status) {
    try {
      let query = 'UPDATE games SET status = $1';
      const params = [status, gameId];
      
      if (status === 'active') {
        query += ', start_time = NOW()';
      } else if (status === 'finished') {
        query += ', end_time = NOW()';
      }
      
      query += ' WHERE id = $2 RETURNING *';
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating game status:', error);
      throw error;
    }
  }

  static async addDrawnNumber(gameId, number) {
    try {
      const result = await pool.query(
        'UPDATE games SET drawn_numbers = array_append(drawn_numbers, $1) WHERE id = $2 RETURNING *',
        [number, gameId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error adding drawn number:', error);
      throw error;
    }
  }

  static async getDrawnNumbers(gameId) {
    try {
      const result = await pool.query(
        'SELECT drawn_numbers FROM games WHERE id = $1',
        [gameId]
      );
      return result.rows[0]?.drawn_numbers || [];
    } catch (error) {
      console.error('Error getting drawn numbers:', error);
      return [];
    }
  }
}

module.exports = Game;