import { pool } from '../config/database.js';

export class Certification {
  // Get all certifications for a user
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM certifications WHERE user_id = $1 ORDER BY year DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding certifications by user_id:', error);
      throw error;
    }
  }

  // Get certification by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM certifications WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding certification by ID:', error);
      throw error;
    }
  }

  // Create new certification
  static async create(userId, certificationData) {
    try {
      const { title, organization, year, credential_id, credential_url, issue_date, expiry_date } = certificationData;
      const result = await pool.query(
        'INSERT INTO certifications (user_id, title, organization, year, credential_id, credential_url, issue_date, expiry_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [userId, title, organization, year, credential_id, credential_url, issue_date, expiry_date, new Date(), new Date()]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating certification:', error);
      throw error;
    }
  }

  // Update certification
  static async update(id, certificationData) {
    try {
      const { title, organization, year, credential_id, credential_url, issue_date, expiry_date } = certificationData;
      const result = await pool.query(
        'UPDATE certifications SET title = $1, organization = $2, year = $3, credential_id = $4, credential_url = $5, issue_date = $6, expiry_date = $7, updated_at = $8 WHERE id = $9 RETURNING *',
        [title, organization, year, credential_id, credential_url, issue_date, expiry_date, new Date(), id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating certification:', error);
      throw error;
    }
  }

  // Delete certification
  static async delete(id, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM certifications WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting certification:', error);
      throw error;
    }
  }

  // Create certifications table
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS certifications (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title TEXT,
          organization TEXT,
          year TEXT,
          credential_id TEXT,
          credential_url TEXT,
          issue_date TEXT,
          expiry_date TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
     
    } catch (error) {
      console.error('❌ Error creating certifications table:', error);
      throw error;
    }
  }
}
