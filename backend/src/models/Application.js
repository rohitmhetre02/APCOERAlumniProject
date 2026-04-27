import { pool } from '../config/database.js';

class Application {
  static schema = {
    tableName: 'applications',
    columns: [
      'id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      'opportunity_id UUID NOT NULL REFERENCES opportunities(id)',
      'user_id UUID NOT NULL REFERENCES users(id)',
      'contact_number VARCHAR(20)',
      'proposal TEXT',
      'resume_url VARCHAR(500)',
      'status VARCHAR(20) NOT NULL DEFAULT \'pending\' CHECK (status IN (\'pending\', \'under_review\', \'shortlisted\', \'rejected\', \'accepted\'))',
      'applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ]
  };

  static async createTable() {
    try {
      const columns = this.schema.columns.join(', ');
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${this.schema.tableName} (
          ${columns}
        );
      `;

      await pool.query(createTableQuery);
      
    } catch (error) {
      console.error(` Error creating ${this.schema.tableName} table:`, error.message);
      throw error;
    }
  }

  static async create(applicationData) {
    try {
      const {
        opportunity_id,
        user_id,
        contact_number,
        proposal,
        resume_url,
        status = 'pending'
      } = applicationData;

      const query = `
        INSERT INTO ${this.schema.tableName} 
        (opportunity_id, user_id, contact_number, proposal, resume_url, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [opportunity_id, user_id, contact_number, proposal, resume_url, status];
      const result = await pool.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error(' Error creating application:', error.message);
      console.error(' Application data:', applicationData);
      console.error(' Full error:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      
      
      const query = `
        SELECT a.*, 
               o.title as opportunity_title, 
               o.company, 
               o.location, 
               o.type as job_type, 
               o.salary_range,
               u.first_name, 
               u.last_name, 
               u.email
        FROM ${this.schema.tableName} a
        JOIN opportunities o ON a.opportunity_id = o.id
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = $1
        ORDER BY a.applied_date DESC
      `;

    
      const result = await pool.query(query, [userId]);
     
      
      if (result.rows.length > 0) {
       
      }
      
      return result.rows;
    } catch (error) {
      console.error(' Error fetching applications by user ID:', error);
      throw error;
    }
  }

  static async getByOpportunityId(opportunityId) {
    try {
  
      
      // First try with LEFT JOIN to get applications even if user data is missing
      const query = `
        SELECT a.*, 
               u.first_name, 
               u.last_name, 
               u.email, 
               u.department, 
               u.passout_year,
               u.contact_number,
               CASE WHEN u.id IS NOT NULL THEN true ELSE false END as user_exists
        FROM ${this.schema.tableName} a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.opportunity_id = $1
        ORDER BY a.applied_date DESC
      `;

    
      const result = await pool.query(query, [opportunityId]);
      
      
      if (result.rows.length > 0) {
       
        
        // Format the data to handle missing user information
        const formattedApplications = result.rows.map(app => ({
          ...app,
          first_name: app.first_name || 'Unknown',
          last_name: app.last_name || 'User',
          email: app.email || 'N/A',
          department: app.department || 'N/A',
          passout_year: app.passout_year || 'N/A',
          contact_number: app.contact_number || 'N/A'
        }));
        
      
        return formattedApplications;
      } else {
        console.log(`🔧 No applications found. Let's check if the table has any data...`);
        
        // Check if there are any applications at all
        const countQuery = `SELECT COUNT(*) as total FROM ${this.schema.tableName}`;
        const countResult = await pool.query(countQuery);
        console.log(`🔧 Total applications in database: ${countResult.rows[0].total}`);
        
        // Check if there are any applications for this opportunity (without user join)
        const simpleQuery = `SELECT * FROM ${this.schema.tableName} WHERE opportunity_id = $1`;
        const simpleResult = await pool.query(simpleQuery, [opportunityId]);
        console.log(`🔧 Simple query result: ${simpleResult.rows.length} rows found`);
        
        if (simpleResult.rows.length > 0) {
          console.log(`🔧 Simple application data:`, simpleResult.rows[0]);
          
          // Try to get user information separately for each application
          const applicationsWithUserData = await Promise.all(
            simpleResult.rows.map(async (app) => {
              try {
                const userQuery = `SELECT first_name, last_name, email, department, passout_year, contact_number FROM users WHERE id = $1`;
                const userResult = await pool.query(userQuery, [app.user_id]);
                const userData = userResult.rows[0] || {};
                
                return {
                  ...app,
                  first_name: userData.first_name || 'Unknown',
                  last_name: userData.last_name || 'User',
                  email: userData.email || 'N/A',
                  department: userData.department || 'N/A',
                  passout_year: userData.passout_year || 'N/A',
                  contact_number: userData.contact_number || 'N/A'
                };
              } catch (userError) {
                console.log(`🔧 Error fetching user for application ${app.id}:`, userError.message);
                return {
                  ...app,
                  first_name: 'Unknown',
                  last_name: 'User',
                  email: 'N/A',
                  department: 'N/A',
                  passout_year: 'N/A',
                  contact_number: 'N/A'
                };
              }
            })
          );
          
         
          return applicationsWithUserData;
        }
      }
      
      return result.rows;
    } catch (error) {
      console.error(' Error fetching applications by opportunity ID:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE ${this.schema.tableName} 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      console.error(' Error updating application status:', error);
      throw error;
    }
  }

  static async checkExistingApplication(userId, opportunityId) {
    try {
      const query = `
        SELECT id FROM ${this.schema.tableName}
        WHERE user_id = $1 AND opportunity_id = $2
      `;

      const result = await pool.query(query, [userId, opportunityId]);
      return result.rows[0];
    } catch (error) {
      console.error(' Error checking existing application:', error);
      console.error(' Query params:', { userId, opportunityId });
      throw error;
    }
  }

  static async getApplicationStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_applications,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
          COUNT(CASE WHEN status = 'shortlisted' THEN 1 END) as shortlisted,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted
        FROM ${this.schema.tableName}
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error(' Error fetching application stats:', error);
      throw error;
    }
  }
}

export default Application;
