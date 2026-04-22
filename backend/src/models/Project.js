import { pool } from '../config/database.js';

export class Project {
  // Get all projects for a user
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM projects WHERE user_id = $1 ORDER BY start_date DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding projects by user_id:', error);
      throw error;
    }
  }

  // Get project by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding project by ID:', error);
      throw error;
    }
  }

  // Create new project
  static async create(userId, projectData) {
    try {
      const { title, description, tech_stack, project_url, github_url } = projectData;
      
      // Validate required fields
      if (!title) {
        throw new Error('Title is required');
      }
      
      const result = await pool.query(
        'INSERT INTO projects (user_id, title, description, tech_stack, project_url, github_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [userId, title, description || null, tech_stack || [], project_url || null, github_url || null, new Date(), new Date()]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update project
  static async update(id, projectData) {
    try {
      const { title, description, tech_stack, project_url, github_url } = projectData;
      const result = await pool.query(
        'UPDATE projects SET title = $1, description = $2, tech_stack = $3, project_url = $4, github_url = $5, updated_at = $6 WHERE id = $7 RETURNING *',
        [title, description, tech_stack, project_url, github_url, new Date(), id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  static async delete(id, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Create projects table
  static async createTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title TEXT,
          description TEXT,
          tech_stack TEXT[],
          project_url TEXT,
          github_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
    } catch (error) {
      console.error('❌ Error creating projects table:', error);
      throw error;
    }
  }
}
