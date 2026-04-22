import { pool } from '../config/database.js';

class Event {
  static schema = {
    tableName: 'events',
    columns: [
      'id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      'title VARCHAR(255) NOT NULL',
      'description TEXT',
      'event_date DATE NOT NULL',
      'event_time TIME NOT NULL',
      'location VARCHAR(255) NOT NULL',
      'event_mode VARCHAR(20) NOT NULL CHECK (event_mode IN (\'online\', \'offline\', \'hybrid\'))',
      'capacity INTEGER NOT NULL CHECK (capacity > 0)',
      'event_type VARCHAR(50) NOT NULL',
      'custom_event_type VARCHAR(50)',
      'image_url VARCHAR(500)',
      'status VARCHAR(20) NOT NULL DEFAULT \'pending\' CHECK (status IN (\'pending\', \'approved\', \'rejected\'))',
      'rejection_reason TEXT',
      'created_by UUID NOT NULL REFERENCES users(id)',
      'created_by_role VARCHAR(20) NOT NULL CHECK (created_by_role IN (\'admin\', \'coordinator\', \'alumni\'))',
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
      console.log(`\u2705 ${this.schema.tableName} table created successfully`);
      
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
        console.log('🔧 Adding rejection_reason column to events table...');
        const addColumnQuery = `
          ALTER TABLE ${this.schema.tableName} 
          ADD COLUMN rejection_reason TEXT
        `;
        await pool.query(addColumnQuery);
        console.log('✅ rejection_reason column added successfully');
      }
      
      // Create guest_speakers table
      await this.createGuestSpeakersTable();
    } catch (error) {
      console.error(`\u274c Error creating ${this.schema.tableName} table:`, error.message);
      throw error;
    }
  }

  static async updateCreatedByRoleConstraint() {
    try {
      console.log('🔧 Updating created_by_role constraint to include alumni...');
      
      // Drop the old constraint if it exists
      const dropConstraintQuery = `
        ALTER TABLE ${this.schema.tableName} 
        DROP CONSTRAINT IF EXISTS events_created_by_role_check
      `;
      await pool.query(dropConstraintQuery);
      
      // Add the new constraint that includes alumni
      const addConstraintQuery = `
        ALTER TABLE ${this.schema.tableName} 
        ADD CONSTRAINT events_created_by_role_check 
        CHECK (created_by_role IN ('admin', 'coordinator', 'alumni'))
      `;
      await pool.query(addConstraintQuery);
      
      console.log('✅ created_by_role constraint updated successfully to include alumni');
    } catch (error) {
      console.error('❌ Error updating created_by_role constraint:', error.message);
      throw error;
    }
  }

  static async createGuestSpeakersTable() {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS event_guest_speakers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          topic VARCHAR(255) NOT NULL,
          role VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await pool.query(query);
      console.log('\u2705 Guest speakers table created successfully');
    } catch (error) {
      console.error('\u274c Error creating guest speakers table:', error.message);
      throw error;
    }
  }

  static async create(eventData) {
    try {
      const {
        title,
        description,
        event_date,
        event_time,
        location,
        event_mode,
        capacity,
        event_type,
        custom_event_type,
        image_url,
        created_by,
        created_by_role,
        guest_speakers
      } = eventData;

      const query = `
        INSERT INTO ${this.schema.tableName} (
          title, description, event_date, event_time, location, event_mode, 
          capacity, event_type, custom_event_type, image_url, created_by, created_by_role, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const values = [
        title, description, event_date, event_time, location, event_mode,
        capacity, event_type, custom_event_type, image_url, created_by, created_by_role,
        created_by_role === 'admin' ? 'approved' : 'pending'
      ];

      const result = await pool.query(query, values);
      const event = result.rows[0];

      // Add guest speakers if provided
      if (guest_speakers && guest_speakers.length > 0) {
        await this.addGuestSpeakers(event.id, guest_speakers);
      }

      console.log(`\u2705 Event created: ${event.title}`);
      return event;
    } catch (error) {
      console.error('\u274c Error creating event:', error.message);
      throw error;
    }
  }

  static async addGuestSpeakers(eventId, guestSpeakers) {
    try {
      const query = `
        INSERT INTO event_guest_speakers (event_id, name, topic, role)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      for (const speaker of guestSpeakers) {
        await pool.query(query, [eventId, speaker.name, speaker.topic, speaker.role]);
      }

      console.log(`\u2705 Added ${guestSpeakers.length} guest speakers to event ${eventId}`);
    } catch (error) {
      console.error('\u274c Error adding guest speakers:', error.message);
      throw error;
    }
  }

  static async getAll(status = 'approved') {
    try {
      let query = `
        SELECT e.*, 
               u.first_name || ' ' || u.last_name as author_name,
               u.email as author_email,
               u.department as author_department,
               e.created_by_role as author_role,
               (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as registrations_count
        FROM ${this.schema.tableName} e
        LEFT JOIN users u ON e.created_by = u.id
      `;

      let params = [];
      
      if (status !== 'all') {
        query += ' WHERE e.status = $1 ORDER BY e.event_date ASC';
        params.push(status);
      } else {
        query += ' ORDER BY e.event_date ASC';
      }

      const result = await pool.query(query, params);
      const events = result.rows;

      // Add guest speakers to each event
      for (const event of events) {
        const speakersQuery = `
          SELECT * FROM event_guest_speakers 
          WHERE event_id = $1 
          ORDER BY created_at ASC
        `;
        const speakersResult = await pool.query(speakersQuery, [event.id]);
        event.guest_speakers = speakersResult.rows;
      }

      return events;
    } catch (error) {
      console.error('❌ Error fetching events:', error.message);
      throw error;
    }
  }

  static async findById(id) {
    try {
      console.log(`🔍 Event.findById: Looking for event with ID: ${id}`);
      
      const query = `
        SELECT e.*, 
               u.first_name || ' ' || u.last_name as author_name,
               u.email as author_email,
               u.department as author_department,
               e.created_by_role as author_role,
               (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as registrations_count
        FROM ${this.schema.tableName} e
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.id = $1
      `;

      const result = await pool.query(query, [id]);
      const event = result.rows[0];
      
      console.log(`🔍 Event.findById: Found event: ${!!event}, rows returned: ${result.rows.length}`);
      if (event) {
        console.log(`🔍 Event.findById: Event title: ${event.title}, created_by: ${event.created_by}`);
      }

      if (event) {
        // Get guest speakers
        const speakersQuery = `
          SELECT * FROM event_guest_speakers 
          WHERE event_id = $1 
          ORDER BY created_at ASC
        `;
        const speakersResult = await pool.query(speakersQuery, [id]);
        event.guest_speakers = speakersResult.rows;

        // Get registration count
        const registrationCountQuery = `
          SELECT COUNT(*) as count
          FROM event_registrations 
          WHERE event_id = $1 AND status = 'registered'
        `;
        const registrationResult = await pool.query(registrationCountQuery, [id]);
        event.registrations_count = parseInt(registrationResult.rows[0].count) || 0;
      }

      return event;
    } catch (error) {
      console.error('❌ Error finding event by ID:', error.message);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const {
        title,
        description,
        event_date,
        event_time,
        location,
        event_mode,
        capacity,
        event_type,
        custom_event_type,
        image_url,
        guest_speakers
      } = updateData;

      const query = `
        UPDATE ${this.schema.tableName} 
        SET 
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          event_date = COALESCE($3, event_date),
          event_time = COALESCE($4, event_time),
          location = COALESCE($5, location),
          event_mode = COALESCE($6, event_mode),
          capacity = COALESCE($7, capacity),
          event_type = COALESCE($8, event_type),
          custom_event_type = COALESCE($9, custom_event_type),
          image_url = COALESCE($10, image_url),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `;

      const values = [
        title, description, event_date, event_time, location, event_mode,
        capacity, event_type, custom_event_type, image_url, id
      ];

      const result = await pool.query(query, values);
      const event = result.rows[0];

      if (!event) {
        throw new Error('Event not found');
      }

      // Update guest speakers if provided
      if (guest_speakers !== undefined) {
        // Remove existing speakers
        await pool.query('DELETE FROM event_guest_speakers WHERE event_id = $1', [id]);
        
        // Add new speakers
        if (guest_speakers && guest_speakers.length > 0) {
          await this.addGuestSpeakers(id, guest_speakers);
        }
      }

      console.log(`✅ Event ${event.id} updated`);
      return event;
    } catch (error) {
      console.error('❌ Error updating event:', error.message);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Delete guest speakers first (due to foreign key constraint)
      await pool.query('DELETE FROM event_guest_speakers WHERE event_id = $1', [id]);
      
      // Delete the event
      const query = `DELETE FROM ${this.schema.tableName} WHERE id = $1`;
      const result = await pool.query(query, [id]);

      if (result.rowCount === 0) {
        throw new Error('Event not found');
      }

      console.log(`✅ Event ${id} deleted`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting event:', error.message);
      throw error;
    }
  }

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
      const event = result.rows[0];

      if (result.rows.length === 0) {
        throw new Error('Event not found');
      }

      // Get author information for email templates
      const authorQuery = `
        SELECT u.first_name || ' ' || u.last_name as author_name,
               u.email as author_email,
               u.id as author_id
        FROM users u
        WHERE u.id = $1
      `;
      
      const authorResult = await pool.query(authorQuery, [event.created_by]);
      
      if (authorResult.rows.length > 0) {
        event.author_name = authorResult.rows[0].author_name;
        event.author_email = authorResult.rows[0].author_email;
      }

      console.log(`🔧 Event ${id} status updated to: ${status}`);
      console.log(`🔧 Author info: ${event.author_name} (${event.author_email})`);
      
      return event;
    } catch (error) {
      console.error('\u274c Error updating event status:', error.message);
      throw error;
    }
  }

  // Get events created by a specific author
  static async getByAuthor(authorId) {
    try {
      // First try without join to see if the basic query works
      const basicQuery = `
        SELECT *
        FROM ${this.schema.tableName}
        WHERE created_by = $1
        ORDER BY created_at DESC
      `;

      const basicResult = await pool.query(basicQuery, [authorId]);
      
      // If basic query works, try with join
      if (basicResult.rows.length > 0) {
        const query = `
          SELECT e.*, 
                 COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') as author_name,
                 COALESCE(u.email, 'unknown@example.com') as author_email,
                 u.department as author_department,
                 e.created_by_role as author_role,
                 (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as registrations_count
          FROM ${this.schema.tableName} e
          LEFT JOIN users u ON e.created_by = u.id
          WHERE e.created_by = $1
          ORDER BY e.created_at DESC
        `;

        const result = await pool.query(query, [authorId]);
        return result.rows;
      }
      
      return basicResult.rows;
    } catch (error) {
      console.error('\u274c Error fetching events by author:', error.message);
      console.error('\u274c Author ID:', authorId);
      console.error('\u274c Table name:', this.schema.tableName);
      throw error;
    }
  }
}

export default Event;
