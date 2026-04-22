import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class Coordinator {
  // Get all coordinators
  static async findAll() {
    try {
      const result = await pool.query(
        'SELECT id, first_name, last_name, email, contact_number, department, is_approved, is_first_login, created_at, updated_at FROM users WHERE role = $1 ORDER BY created_at DESC',
        ['coordinator']
      );
      
      // Get alumni count for each coordinator's department
      const coordinatorsWithCounts = await Promise.all(
        result.rows.map(async (coordinator) => {
          const alumniCountResult = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE department = $1 AND role = $2',
            [coordinator.department, 'alumni']
          );
          
          return {
            ...coordinator,
            fullName: `${coordinator.first_name} ${coordinator.last_name}`,
            alumniCount: parseInt(alumniCountResult.rows[0].count) || 0,
            status: coordinator.is_approved ? 'active' : 'inactive'
          };
        })
      );
      
      return coordinatorsWithCounts;
    } catch (error) {
      console.error('Error finding all coordinators:', error);
      throw error;
    }
  }

  // Find coordinator by ID
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT id, first_name, last_name, email, contact_number, department, is_approved, is_first_login, created_at, updated_at FROM users WHERE id = $1 AND role = $2',
        [id, 'coordinator']
      );
      const coordinator = result.rows[0];
      if (coordinator) {
        return {
          ...coordinator,
          status: coordinator.is_approved ? 'active' : 'inactive'
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding coordinator by ID:', error);
      throw error;
    }
  }

  // Find coordinator by email
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT id, first_name, last_name, email, contact_number, department, is_approved, is_first_login, password, created_at, updated_at FROM users WHERE email = $1 AND role = $2',
        [email, 'coordinator']
      );
      const coordinator = result.rows[0];
      if (coordinator) {
        return {
          ...coordinator,
          status: coordinator.is_approved ? 'active' : 'inactive'
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding coordinator by email:', error);
      throw error;
    }
  }

  // Create new coordinator
  static async create(coordinatorData) {
    try {
      const { first_name, last_name, email, contact_number, department } = coordinatorData;
      
      // Generate random temporary password
      const temporaryPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
      
      const result = await pool.query(
        'INSERT INTO users (first_name, last_name, email, contact_number, department, password, role, is_approved, is_first_login, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, first_name, last_name, email, contact_number, department, is_approved, is_first_login, created_at, updated_at',
        [first_name, last_name, email, contact_number, department, hashedPassword, 'coordinator', false, true, new Date(), new Date()]
      );
      
      const coordinator = result.rows[0];
      return {
        coordinator: {
          ...coordinator,
          status: coordinator.is_approved ? 'active' : 'inactive'
        },
        temporaryPassword
      };
    } catch (error) {
      console.error('Error creating coordinator:', error);
      throw error;
    }
  }

  // Update coordinator password
  static async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await pool.query(
        'UPDATE users SET password = $1, is_first_login = $2, is_approved = $3, status = $4, updated_at = $5 WHERE id = $6 AND role = $7 RETURNING id, first_name, last_name, email, contact_number, department, is_approved, is_first_login, status, role, created_at, updated_at',
        [hashedPassword, false, true, 'active', new Date(), id, 'coordinator']
      );
      const coordinator = result.rows[0];
      if (coordinator) {
        console.log(`✅ Coordinator ${id} status updated to 'active' after password reset`);
        return {
          ...coordinator,
          status: coordinator.status || 'active'
        };
      }
      return null;
    } catch (error) {
      console.error('Error updating coordinator password:', error);
      throw error;
    }
  }

  // Delete coordinator
  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id, first_name, last_name, email',
        [id, 'coordinator']
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting coordinator:', error);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(email, password) {
    try {
      const coordinator = await this.findByEmail(email);
      if (!coordinator) {
        return null;
      }
      
      const isValid = await bcrypt.compare(password, coordinator.password);
      if (!isValid) {
        return null;
      }
      
      // Remove password from returned object
      const { password: _, ...coordinatorWithoutPassword } = coordinator;
      return coordinatorWithoutPassword;
    } catch (error) {
      console.error('Error verifying coordinator password:', error);
      throw error;
    }
  }

  // Get dashboard stats for coordinator (also accessible by admin)
  static async getDashboardStats(userId, department, userRole = 'coordinator') {
    try {
      console.log(`Getting dashboard stats for ${userRole}: ${userId}, department: ${department}`);
      
      // Get alumni count for the specified department
      const alumniResult = await pool.query(
        'SELECT COUNT(*) as total, COUNT(CASE WHEN is_approved = true THEN 1 END) as active FROM users WHERE department = $1 AND role = $2',
        [department, 'alumni']
      );
      
      // Get recent registrations (last 30 days)
      const recentResult = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE department = $1 AND role = $2 AND created_at >= NOW() - INTERVAL \'30 days\'',
        [department, 'alumni']
      );
      
      // Get pending users for approval
      const pendingResult = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE department = $1 AND role = $2 AND is_approved = false',
        [department, 'alumni']
      );

      // Get department events count
      const eventsResult = await pool.query(
        'SELECT COUNT(*) as total FROM events WHERE created_by IN (SELECT id FROM users WHERE department = $1)',
        [department]
      );

      // Get department opportunities count
      const opportunitiesResult = await pool.query(
        'SELECT COUNT(*) as total FROM opportunities WHERE author_id IN (SELECT id FROM users WHERE department = $1)',
        [department]
      );
       
      const stats = {
        totalAlumni: parseInt(alumniResult.rows[0].total),
        activeAlumni: parseInt(alumniResult.rows[0].active),
        recentRegistrations: parseInt(recentResult.rows[0].count),
        pendingApprovals: parseInt(pendingResult.rows[0].count),
        departmentEvents: {
          total: parseInt(eventsResult.rows[0].total)
        },
        departmentOpportunities: {
          total: parseInt(opportunitiesResult.rows[0].total)
        }
      };

      console.log('Dashboard stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }
}
