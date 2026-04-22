import { pool } from '../config/database.js';

export class Profile {
  // Get profile by user_id
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM profiles WHERE user_id = $1',
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding profile by user_id:', error);
      throw error;
    }
  }

  // Create or update profile
  static async upsert(userId, profileData) {
    try {
      const { department, graduation_year, location, contact_number, bio, prn_number } = profileData;
      
      // Check if profile exists
      const existingProfile = await this.findByUserId(userId);
      
      if (existingProfile) {
        // Update existing profile
        const result = await pool.query(
          'UPDATE profiles SET department = $1, graduation_year = $2, location = $3, contact_number = $4, bio = $5, prn_number = $6, updated_at = $7 WHERE user_id = $8 RETURNING *',
          [department, graduation_year, location, contact_number, bio, prn_number, new Date(), userId]
        );
        return result.rows[0];
      } else {
        // Create new profile
        const result = await pool.query(
          'INSERT INTO profiles (user_id, department, graduation_year, location, contact_number, bio, prn_number, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
          [userId, department || null, graduation_year || null, location || null, contact_number || null, bio || null, prn_number || null, new Date(), new Date()]
        );
        return result.rows[0];
      }
    } catch (error) {
      console.error('Error upserting profile:', error);
      throw error;
    }
  }

  // Update profile image
  static async updateProfileImage(userId, imageUrl) {
    try {
      const result = await pool.query(
        'UPDATE profiles SET profile_image = $1, updated_at = $2 WHERE user_id = $3 RETURNING *',
        [imageUrl, new Date(), userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  }

  // Create profile table
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS profiles (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          profile_image TEXT,
          department TEXT,
          graduation_year TEXT,
          location TEXT,
          contact_number TEXT,
          prn_number TEXT,
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add PRN column if it doesn't exist (for existing tables)
      try {
        await pool.query(`
          ALTER TABLE profiles 
          ADD COLUMN IF NOT EXISTS prn_number TEXT
        `);
       
      } catch (alterError) {
        // Column might already exist, which is fine
        
      }
      
      
    } catch (error) {
      console.error('❌ Error creating profiles table:', error);
      throw error;
    }
  }
}
