import { pool } from '../config/database.js';

export class Notification {
  static schema = {
    tableName: 'notifications',
    fields: {
      id: 'UUID DEFAULT gen_random_uuid() PRIMARY KEY',
      user_id: 'UUID', // nullable - can be for specific user or general admin notifications
      message: 'VARCHAR(500) NOT NULL',
      type: 'VARCHAR(50) DEFAULT \'info\'', // approval, info, warning, success, error
      department: 'VARCHAR(100)', // department reference for department-specific notifications
      is_read: 'BOOLEAN DEFAULT FALSE',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    }
  };

  // Create notifications table
  static async createTable() {
    try {
      // Check if table exists
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${this.schema.tableName}'
        );
      `;
      
      const tableExistsResult = await pool.query(checkTableQuery);
      const tableExists = tableExistsResult.rows[0].exists;
      
      if (tableExists) {
        console.log(`✅ ${this.schema.tableName} table already exists, skipping creation`);
        return;
      }
      
      const createTableQuery = `
        CREATE TABLE ${this.schema.tableName} (
          id ${this.schema.fields.id},
          user_id ${this.schema.fields.user_id},
          message ${this.schema.fields.message},
          type ${this.schema.fields.type},
          department ${this.schema.fields.department},
          is_read ${this.schema.fields.is_read},
          created_at ${this.schema.fields.created_at},
          updated_at ${this.schema.fields.updated_at}
        )
      `;

      
      await pool.query(createTableQuery);
      
      
    } catch (error) {
      console.error(`❌ Error creating ${this.schema.tableName} table:`, error.message);
      throw error;
    }
  }

  // Create a new notification
  static async create(notificationData) {
    try {
      const { user_id, message, type = 'info', department } = notificationData;
      
      const insertQuery = `
        INSERT INTO ${this.schema.tableName} 
        (user_id, message, type, department, created_at, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [user_id, message, type, department]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating notification:', error.message);
      throw error;
    }
  }

  // Get all notifications (for admin)
  static async getAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT * FROM ${this.schema.tableName}
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error.message);
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadCount() {
    try {
      const query = `
        SELECT COUNT(*) as count FROM ${this.schema.tableName}
        WHERE is_read = FALSE
      `;
      
      const result = await pool.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('❌ Error fetching unread count:', error.message);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const updateQuery = `
        UPDATE ${this.schema.tableName}
        SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [notificationId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error marking notification as read:', error.message);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead() {
    try {
      const updateQuery = `
        UPDATE ${this.schema.tableName}
        SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE is_read = FALSE
      `;
      
      await pool.query(updateQuery);
      return true;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error.message);
      throw error;
    }
  }

  // Delete notification
  static async delete(notificationId) {
    try {
      const deleteQuery = `
        DELETE FROM ${this.schema.tableName}
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(deleteQuery, [notificationId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error deleting notification:', error.message);
      throw error;
    }
  }

  // Initialize notification system
  static async init() {
    try {
      
      await this.createTable();
      
    } catch (error) {
      console.error('❌ Error initializing Notification system:', error.message);
      throw error;
    }
  }
}

export default Notification;
