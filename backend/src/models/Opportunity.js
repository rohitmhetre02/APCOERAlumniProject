import { pool } from '../config/database.js';

class Opportunity {
  static schema = {
    tableName: 'opportunities',
    columns: [
      'id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      'title VARCHAR(255) NOT NULL',
      'company VARCHAR(255) NOT NULL',
      'description TEXT NOT NULL',
      'type VARCHAR(50) NOT NULL',
      'location VARCHAR(255)',
      'salary_range VARCHAR(255)',
      'experience_range VARCHAR(50)',
      'deadline DATE',
      'skills TEXT[]',
      'status VARCHAR(20) DEFAULT \'active\'',
      'rejection_reason TEXT',
      'author_id UUID NOT NULL',
      'author_role VARCHAR(20) NOT NULL',
      'applications_count INTEGER DEFAULT 0',
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ]
  };

  // Create opportunities table
  static async createTable() {
    try {
      // Check if table already exists
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${this.schema.tableName}'
        );
      `;
      
      const tableExists = await pool.query(checkTableQuery);
      
      if (!tableExists.rows[0].exists) {
        const columns = this.schema.columns.join(', ');
        const query = `
          CREATE TABLE ${this.schema.tableName} (
            ${columns}
          );
        `;

        await pool.query(query);
        
      } else {
        // Check if rejection_reason column exists and add it if it doesn't
        const checkColumnQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '${this.schema.tableName}'
            AND column_name = 'rejection_reason'
          );
        `;
        
        const columnExists = await pool.query(checkColumnQuery);
        
        if (!columnExists.rows[0].exists) {
          console.log('🔧 Adding rejection_reason column to opportunities table...');
          const addColumnQuery = `
            ALTER TABLE ${this.schema.tableName} 
            ADD COLUMN rejection_reason TEXT
          `;
          await pool.query(addColumnQuery);
          console.log('✅ rejection_reason column added successfully');
        }
      }

      // Applications table is created by Application model, no need to create here
    } catch (error) {
      console.error(`\u274c Error creating ${this.schema.tableName} table:`, error.message);
      throw error;
    }
  }

  // Get all opportunities (for alumni frontend)
  static async getAll(status = 'active') {
    try {
      let query = `
        SELECT o.*, 
               u.first_name || ' ' || u.last_name as author_name,
               u.email as author_email,
               u.department as author_department
        FROM ${this.schema.tableName} o
        LEFT JOIN users u ON o.author_id = u.id
      `;

      if (status !== 'all') {
        query += ` WHERE o.status = '${status}'`;
      }
      
      query += ' ORDER BY o.created_at DESC';

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all opportunities:', error.message);
      throw error;
    }
  }

  // Get opportunities by author
  static async getByAuthor(authorId) {
    try {
      // First try without join to see if the basic query works
      const basicQuery = `
        SELECT *
        FROM ${this.schema.tableName}
        WHERE author_id = $1
        ORDER BY created_at DESC
      `;

      const basicResult = await pool.query(basicQuery, [authorId]);
      
      // If basic query works, try with join
      if (basicResult.rows.length > 0) {
        const query = `
          SELECT o.*, 
                 COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') as author_name,
                 COALESCE(u.email, 'unknown@example.com') as author_email,
                 u.department as author_department
          FROM ${this.schema.tableName} o
          LEFT JOIN users u ON o.author_id = u.id
          WHERE o.author_id = $1
          ORDER BY o.created_at DESC
        `;

        const result = await pool.query(query, [authorId]);
        return result.rows;
      }
      
      return basicResult.rows;
    } catch (error) {
      
      throw error;
    }
  }

  // Create new opportunity
  static async create(opportunityData) {
    try {
      const {
        title,
        company,
        type,
        location,
        salary_range,
        experience_range,
        deadline,
        skills,
        description,
        author_id,
        author_role
      } = opportunityData;

      // Set status based on author role
      const status = author_role === 'admin' ? 'approved' : 'pending';
      
      const query = `
        INSERT INTO ${this.schema.tableName} (
          title, company, type, location, salary_range, experience_range,
          deadline, skills, description, author_id, author_role, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      // Handle skills - convert string to array if needed
      const skillsArray = Array.isArray(skills) ? skills : 
                         (skills && typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s) : []);

      const values = [
        title, company, type, location, salary_range, experience_range,
        deadline, skillsArray, description, author_id, author_role, status
      ];

      const result = await pool.query(query, values);
      const opportunity = result.rows[0];

      
      return opportunity;
    } catch (error) {
      console.error('Error creating opportunity:', error.message);
      throw error;
    }
  }

  // Find opportunity by ID
  static async findById(id) {
    try {
      const query = `
        SELECT o.*, 
               u.first_name || ' ' || u.last_name as author_name,
               u.email as author_email
        FROM ${this.schema.tableName} o
        LEFT JOIN users u ON o.author_id = u.id
        WHERE o.id = $1
      `;

      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error finding opportunity by ID:', error.message);
      throw error;
    }
  }

  // Update opportunity
  static async update(id, updateData) {
    try {
      const {
        title,
        company,
        type,
        location,
        salary_range,
        experience_range,
        deadline,
        skills,
        description
      } = updateData;

      // Handle skills - convert string to array if needed
      const skillsArray = Array.isArray(skills) ? skills : 
                         (skills && typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s) : skills);

      const query = `
        UPDATE ${this.schema.tableName}
        SET title = $1, company = $2, type = $3, location = $4, 
            salary_range = $5, experience_range = $6, deadline = $7,
            skills = $8, description = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `;

      const values = [
        title, company, type, location, salary_range, experience_range,
        deadline, skillsArray, description, id
      ];

      const result = await pool.query(query, values);
      const opportunity = result.rows[0];

      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      
      return opportunity;
    } catch (error) {
      console.error('Error updating opportunity:', error.message);
      throw error;
    }
  }

  // Increment application count
  static async incrementApplications(id) {
    try {
      const query = `
        UPDATE ${this.schema.tableName}
        SET applications_count = COALESCE(applications_count, 0) + 1
        WHERE id = $1
        RETURNING applications_count
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error incrementing applications:', error.message);
      throw error;
    }
  }

  
  // Update opportunity status
  static async updateStatus(id, status, rejectionReason = null) {
    try {
      const query = `
        UPDATE ${this.schema.tableName} 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        ${rejectionReason ? ', rejection_reason = $3' : ''}
        WHERE id = $2
        RETURNING *
      `;

      const params = rejectionReason ? [status, id, rejectionReason] : [status, id];
      const result = await pool.query(query, params);
      const opportunity = result.rows[0];

      if (result.rows.length === 0) {
        throw new Error('Opportunity not found');
      }

      // Get author information for email templates
      const authorQuery = `
        SELECT u.first_name || ' ' || u.last_name as author_name,
               u.email as author_email,
               u.id as author_id
        FROM users u
        WHERE u.id = $1
      `;
      
      const authorResult = await pool.query(authorQuery, [opportunity.author_id]);
      
      if (authorResult.rows.length > 0) {
        opportunity.author_name = authorResult.rows[0].author_name;
        opportunity.author_email = authorResult.rows[0].author_email;
        opportunity.created_by = authorResult.rows[0].author_id;
      }

      console.log(`🔧 Opportunity ${id} status updated to: ${status}`);
      console.log(`🔧 Author info: ${opportunity.author_name} (${opportunity.author_email})`);
      
      return opportunity;
    } catch (error) {
      console.error('❌ Error updating opportunity status:', error.message);
      throw error;
    }
  }

  // Delete opportunity
  static async delete(id) {
    try {
      const query = `
        DELETE FROM ${this.schema.tableName}
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting opportunity:', error.message);
      throw error;
    }
  }

  // Increment applications count
  static async incrementApplicationsCount(id) {
    try {
      const query = `
        UPDATE ${this.schema.tableName} 
        SET applications_count = COALESCE(applications_count, 0) + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error incrementing applications count:', error.message);
      throw error;
    }
  }

  // Get applications for a specific opportunity
  static async getApplications(opportunityId) {
    try {
      const query = `
        SELECT 
          a.id,
          a.opportunity_id,
          a.user_id,
          a.resume_url,
          a.proposal,
          a.status,
          a.applied_date,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email
        FROM applications a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.opportunity_id = $1
        ORDER BY a.applied_date DESC
      `;

      const result = await pool.query(query, [opportunityId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching applications:', error.message);
      throw error;
    }
  }

  // Accept an application
  static async acceptApplication(applicationId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First verify that the application belongs to an opportunity created by this user
      const verifyQuery = `
        SELECT a.id, a.opportunity_id, a.status, o.author_id
        FROM applications a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.id = $1 AND o.author_id = $2
      `;

      const verifyResult = await client.query(verifyQuery, [applicationId, userId]);
      
      if (verifyResult.rows.length === 0) {
        throw new Error('Application not found or you do not have permission to manage it');
      }

      const application = verifyResult.rows[0];

      if (application.status === 'accepted') {
        throw new Error('Application has already been accepted');
      }

      // Update application status
      const updateQuery = `
        UPDATE applications 
        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [applicationId]);

      await client.query('COMMIT');
      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error accepting application:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Reject an application
  static async rejectApplication(applicationId, userId, rejectionReason) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First verify that the application belongs to an opportunity created by this user
      const verifyQuery = `
        SELECT a.id, a.opportunity_id, a.status, o.author_id
        FROM applications a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.id = $1 AND o.author_id = $2
      `;

      const verifyResult = await client.query(verifyQuery, [applicationId, userId]);
      
      if (verifyResult.rows.length === 0) {
        throw new Error('Application not found or you do not have permission to manage it');
      }

      const application = verifyResult.rows[0];

      if (application.status === 'rejected') {
        throw new Error('Application has already been rejected');
      }

      // Update application status
      const updateQuery = `
        UPDATE applications 
        SET status = 'rejected', rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [applicationId, rejectionReason]);

      await client.query('COMMIT');
      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error rejecting application:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }
}

export default Opportunity;
