import { pool } from '../config/database.js';

export class Skill {
  // Get all skills for a user
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM skills WHERE user_id = $1 ORDER BY skill_name ASC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding skills by user_id:', error);
      throw error;
    }
  }

  // Get skill by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM skills WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding skill by ID:', error);
      throw error;
    }
  }

  // Create new skill
  static async create(userId, skillData) {
    try {
      const { skill_name } = skillData;
      const result = await pool.query(
        'INSERT INTO skills (user_id, skill_name, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, skill_name, new Date(), new Date()]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  }

  // Delete skill
  static async delete(id, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM skills WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  }

  // Create skills table
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS skills (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          skill_name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    
    } catch (error) {
      console.error('❌ Error creating skills table:', error);
      throw error;
    }
  }
}
