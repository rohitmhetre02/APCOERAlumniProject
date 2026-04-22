import { pool } from '../config/database.js';

export class Experience {
  // Get all experience records for a user
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM experience WHERE user_id = $1 ORDER BY start_date DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding experience by user_id:', error);
      throw error;
    }
  }

  // Get experience by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM experience WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding experience by ID:', error);
      throw error;
    }
  }

  // Create new experience record
  static async create(userId, experienceData) {
    try {
      const { role, company, start_date, end_date, location, description, employment_type } = experienceData;
      const result = await pool.query(
        'INSERT INTO experience (user_id, role, company, start_date, end_date, location, description, employment_type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [userId, role, company, start_date, end_date, location, description, employment_type, new Date(), new Date()]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating experience:', error);
      throw error;
    }
  }

  // Update experience record
  static async update(id, experienceData) {
    try {
      const { role, company, start_date, end_date, location, description, employment_type } = experienceData;
      const result = await pool.query(
        'UPDATE experience SET role = $1, company = $2, start_date = $3, end_date = $4, location = $5, description = $6, employment_type = $7, updated_at = $8 WHERE id = $9 RETURNING *',
        [role, company, start_date, end_date, location, description, employment_type, new Date(), id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  }

  // Delete experience record
  static async delete(id, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM experience WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  }

  // Create experience table
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS experience (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          role TEXT,
          company TEXT,
          start_date TEXT,
          end_date TEXT,
          location TEXT,
          description TEXT,
          employment_type TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Experience table created successfully');
    } catch (error) {
      console.error('❌ Error creating experience table:', error);
      throw error;
    }
  }

  // Separate migration function to add employment_type column
  static async migrateEmploymentType() {
    try {
      console.log('🔄 Adding employment_type column to experience table...');
      
      // Check if column exists first
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'experience' 
        AND column_name = 'employment_type'
      `);
      
      if (columnCheck.rows.length === 0) {
        // Column doesn't exist, add it
        await pool.query(`
          ALTER TABLE experience 
          ADD COLUMN employment_type TEXT
        `);
       
      } else {
        console.log('ℹ️ employment_type column already exists in experience table');
      }
    } catch (error) {
      console.error('❌ Error adding employment_type column:', error);
      throw error;
    }
  }
}
