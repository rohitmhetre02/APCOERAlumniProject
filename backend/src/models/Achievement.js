import { pool } from '../config/database.js';

export class Achievement {
  // Get all achievements for a user
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM achievements WHERE user_id = $1 ORDER BY date DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding achievements by user_id:', error);
      throw error;
    }
  }

  // Get achievement by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM achievements WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding achievement by ID:', error);
      throw error;
    }
  }

  // Create new achievement
  static async create(userId, achievementData) {
    try {
      const { title, description, date } = achievementData;
      const result = await pool.query(
        'INSERT INTO achievements (user_id, title, description, date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, title, description, date, new Date(), new Date()]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }
  }

  // Update achievement
  static async update(id, achievementData) {
    try {
      const { title, description, date } = achievementData;
      const result = await pool.query(
        'UPDATE achievements SET title = $1, description = $2, date = $3, updated_at = $4 WHERE id = $5 RETURNING *',
        [title, description, date, new Date(), id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating achievement:', error);
      throw error;
    }
  }

  // Delete achievement
  static async delete(id, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM achievements WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting achievement:', error);
      throw error;
    }
  }

  // Create achievements table
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS achievements (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title TEXT,
          description TEXT,
          date TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
    } catch (error) {
      console.error('❌ Error creating achievements table:', error);
      throw error;
    }
  }
}
