import { pool } from '../config/database.js';

export class Language {
  // Get all languages for a user
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM languages WHERE user_id = $1 ORDER BY language ASC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding languages by user_id:', error);
      throw error;
    }
  }

  // Get language by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM languages WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding language by ID:', error);
      throw error;
    }
  }

  // Create new language
  static async create(userId, languageData) {
    try {
      const { language, proficiency } = languageData;
      const result = await pool.query(
        'INSERT INTO languages (user_id, language, proficiency, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, language, proficiency, new Date(), new Date()]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating language:', error);
      throw error;
    }
  }

  // Update language
  static async update(id, languageData) {
    try {
      const { language, proficiency } = languageData;
      const result = await pool.query(
        'UPDATE languages SET language = $1, proficiency = $2, updated_at = $3 WHERE id = $4 RETURNING *',
        [language, proficiency, new Date(), id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  }

  // Delete language
  static async delete(id, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM languages WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting language:', error);
      throw error;
    }
  }

  // Create languages table
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS languages (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          language TEXT,
          proficiency TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
    } catch (error) {
      console.error('❌ Error creating languages table:', error);
      throw error;
    }
  }
}
