import { pool } from '../config/database.js';

export class Education {
  // Get all education records for a user
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM education WHERE user_id = $1 ORDER BY end_year DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding education by user_id:', error);
      throw error;
    }
  }

  // Get education by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM education WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding education by ID:', error);
      throw error;
    }
  }

  // Create new education record
  static async create(userId, educationData) {
    try {
      const { degree, field, college, start_year, end_year, cgpa } = educationData;
      const result = await pool.query(
        'INSERT INTO education (user_id, degree, field, college, start_year, end_year, cgpa, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [userId, degree, field, college, start_year, end_year, cgpa, new Date(), new Date()]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating education:', error);
      throw error;
    }
  }

  // Update education record
  static async update(id, educationData) {
    try {
      const { degree, field, college, start_year, end_year, cgpa } = educationData;
      const result = await pool.query(
        'UPDATE education SET degree = $1, field = $2, college = $3, start_year = $4, end_year = $5, cgpa = $6, updated_at = $7 WHERE id = $8 RETURNING *',
        [degree, field, college, start_year, end_year, cgpa, new Date(), id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating education:', error);
      throw error;
    }
  }

  // Delete education record
  static async delete(id, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM education WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting education:', error);
      throw error;
    }
  }

  // Create education table
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS education (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          degree TEXT,
          field TEXT,
          college TEXT,
          start_year TEXT,
          end_year TEXT,
          cgpa TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
     
    } catch (error) {
      console.error('❌ Error creating education table:', error);
      throw error;
    }
  }
}
