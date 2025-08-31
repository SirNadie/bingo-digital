const pool = require('../config/database');

class User {
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, username, email, credits, is_admin, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }

  static async updateCredits(userId, newCredits) {
    const result = await pool.query(
      'UPDATE users SET credits = $1 WHERE id = $2 RETURNING credits',
      [newCredits, userId]
    );
    return result.rows[0];
  }
}

module.exports = User;