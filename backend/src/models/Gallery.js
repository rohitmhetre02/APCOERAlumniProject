import { pool } from '../config/database.js';

export class Gallery {
  // Get all images
  static async getAll() {
    try {
      const result = await pool.query(
        'SELECT * FROM gallery ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw error;
    }
  }

  // Get image by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM gallery WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding gallery image by ID:', error);
      throw error;
    }
  }

  // Create new image
  static async create(imageData) {
    try {
      const { image_url, uploaded_by } = imageData;
      const result = await pool.query(
        'INSERT INTO gallery (image_url, uploaded_by, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [image_url, uploaded_by, new Date(), new Date()]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating gallery image:', error);
      throw error;
    }
  }

  
  // Delete image
  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM gallery WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      throw error;
    }
  }

  // Create gallery table
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS gallery (
          id SERIAL PRIMARY KEY,
          image_url TEXT NOT NULL,
          uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Gallery table created successfully');
    } catch (error) {
      console.error('❌ Error creating gallery table:', error);
      throw error;
    }
  }
}
