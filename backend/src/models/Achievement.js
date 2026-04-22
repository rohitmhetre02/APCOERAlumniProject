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
      const { title, description, date, type } = achievementData;
      const result = await pool.query(
        'INSERT INTO achievements (user_id, title, description, date, type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [userId, title, description, date, type, new Date(), new Date()]
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
      const { title, description, date, type } = achievementData;
      const result = await pool.query(
        'UPDATE achievements SET title = $1, description = $2, date = $3, type = $4, updated_at = $5 WHERE id = $6 RETURNING *',
        [title, description, date, type, new Date(), id]
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
          type TEXT,
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
