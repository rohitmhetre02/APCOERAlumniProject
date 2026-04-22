import { pool } from '../config/database.js';

class EventRegistration {
  static schema = {
    tableName: 'event_registrations',
    columns: [
      'id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      'event_id UUID NOT NULL REFERENCES events(id)',
      'user_id UUID NOT NULL REFERENCES users(id)',
      'first_name VARCHAR(255) NOT NULL',
      'last_name VARCHAR(255) NOT NULL',
      'email VARCHAR(255) NOT NULL',
      'phone VARCHAR(50)',
      'message TEXT',
      'registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'status VARCHAR(20) NOT NULL DEFAULT \'registered\' CHECK (status IN (\'registered\', \'cancelled\', \'attended\', \'accepted\', \'rejected\', \'pending\'))',
      'rejection_reason TEXT',
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
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
      console.log(`✅ ${this.schema.tableName} table created successfully`);
    } catch (error) {
      console.error(`❌ Error creating ${this.schema.tableName} table:`, error.message);
      throw error;
    }
  }

  static async create(registrationData) {
    try {
      const {
        event_id,
        user_id,
        contact_number,
        status = 'registered'
      } = registrationData;

      const query = `
        INSERT INTO ${this.schema.tableName} 
        (event_id, user_id, contact_number, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const values = [event_id, user_id, contact_number, status];
      const result = await pool.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating event registration:', error.message);
      throw error;
    }
  }

  static async checkExistingRegistration(userId, eventId) {
    try {
      const query = `
        SELECT id FROM ${this.schema.tableName}
        WHERE user_id = $1 AND event_id = $2 AND status != 'cancelled'
      `;

      const result = await pool.query(query, [userId, eventId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error checking existing registration:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      const query = `
        SELECT er.*, e.title as event_title, e.description, e.event_date, e.location, e.event_type,
               u.first_name, u.last_name, u.email
        FROM ${this.schema.tableName} er
        JOIN events e ON er.event_id = e.id
        JOIN users u ON er.user_id = u.id
        WHERE er.user_id = $1
        ORDER BY er.registration_date DESC
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting user registrations:', error);
      throw error;
    }
  }

  static async getByEventId(eventId) {
    try {
      const query = `
        SELECT 
          er.id,
          er.user_id,
          er.event_id,
          er.status,
          er.created_at,
          er.updated_at,
          u.first_name,
          u.last_name,
          u.email,
          u.department,
          u.passout_year,
          u.contact_number
        FROM ${this.schema.tableName} er
        LEFT JOIN users u ON er.user_id = u.id
        WHERE er.event_id = $1
        ORDER BY er.created_at DESC
      `;

      const result = await pool.query(query, [eventId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting event registrations:', error);
      throw error;
    }
  }

  static async getRegistrationStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_registrations,
          COUNT(CASE WHEN status = 'registered' THEN 1 END) as registered,
          COUNT(CASE WHEN status = 'attended' THEN 1 END) as attended,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
        FROM ${this.schema.tableName}
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error getting registration stats:', error);
      throw error;
    }
  }
}

export default EventRegistration;
