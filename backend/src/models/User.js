import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Table schema definition
  static schema = {
    tableName: 'users',
    fields: {
      id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      first_name: 'VARCHAR(50) NOT NULL',
      last_name: 'VARCHAR(50) NOT NULL',
      email: 'VARCHAR(255) UNIQUE NOT NULL',
      password: 'VARCHAR(255) NOT NULL',
      prn_number: 'VARCHAR(9) UNIQUE',
      contact_number: 'VARCHAR(10)',
      department: 'VARCHAR(100)',
      passout_year: 'INTEGER',
      profile_image: 'TEXT',
      role: "VARCHAR(20) DEFAULT 'alumni'",
      status: "VARCHAR(20) DEFAULT 'inactive'",
      is_approved: 'BOOLEAN DEFAULT FALSE',
      is_first_login: 'BOOLEAN DEFAULT TRUE',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    }
  };

  // Create table
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
        
        // Check if all required columns exist
        await this.ensureColumnsExist();
        return;
      }
      
      const createTableQuery = `
        CREATE TABLE ${this.schema.tableName} (
          id ${this.schema.fields.id},
          first_name ${this.schema.fields.first_name},
          last_name ${this.schema.fields.last_name},
          email ${this.schema.fields.email},
          password ${this.schema.fields.password},
          prn_number ${this.schema.fields.prn_number},
          contact_number ${this.schema.fields.contact_number},
          department ${this.schema.fields.department},
          passout_year ${this.schema.fields.passout_year},
          role ${this.schema.fields.role},
          is_approved ${this.schema.fields.is_approved},
          is_first_login ${this.schema.fields.is_first_login},
          created_at ${this.schema.fields.created_at},
          updated_at ${this.schema.fields.updated_at}
        )
      `;

      console.log('🔧 Creating new table with all columns...');
      // Create table
      await pool.query(createTableQuery);
      
      console.log('📋 Table columns: id, first_name, last_name, email, password, prn_number, contact_number, department, passout_year, role, is_approved, is_first_login, created_at, updated_at');
      
      // Create indexes for better performance
      await this.createIndexes();
      
    } catch (error) {
      console.error(`❌ Error creating ${this.schema.tableName} table:`, error.message);
      console.error('🔍 Query that failed:', error.message);
      throw error;
    }
  };

  // Ensure all required columns exist (for schema updates)
  static async ensureColumnsExist() {
    try {
      console.log('🔍 Checking table columns...');
      
      // Get existing columns
      const columnsQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${this.schema.tableName}'
      `;
      
      const columnsResult = await pool.query(columnsQuery);
      const existingColumns = columnsResult.rows.map(row => row.column_name);
      
      
      
      // Check and add missing columns
      const requiredColumns = Object.keys(this.schema.fields);
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        
        
        for (const column of missingColumns) {
          const alterQuery = `
            ALTER TABLE ${this.schema.tableName} 
            ADD COLUMN IF NOT EXISTS ${column} ${this.schema.fields[column]}
          `;
          await pool.query(alterQuery);
          console.log(`✅ Added column: ${column}`);
        }
      } else {
        console.log('✅ All required columns exist');
      }
      
    } catch (error) {
      console.error('❌ Error ensuring columns exist:', error.message);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    try {
      const { first_name, last_name, contact_number, department, passout_year } = profileData;
      
      const query = `
        UPDATE ${this.schema.tableName} 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            contact_number = COALESCE($3, contact_number),
            department = COALESCE($4, department),
            passout_year = COALESCE($5, passout_year),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;

      const result = await pool.query(query, [first_name, last_name, contact_number, department, passout_year, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Update profile image
  static async updateProfileImage(userId, imageUrl) {
    try {
      const query = `
        UPDATE ${this.schema.tableName} 
        SET profile_image = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [imageUrl, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  }

  // Add new columns to existing table
  static async addNewColumns() {
    try {
      console.log('🔧 addNewColumns() started...');
      
      // Add columns without UNIQUE constraint first
      const alterQueries = [
        `ALTER TABLE ${this.schema.tableName} ADD COLUMN IF NOT EXISTS prn_number VARCHAR(9)`,
        `ALTER TABLE ${this.schema.tableName} ADD COLUMN IF NOT EXISTS contact_number VARCHAR(10)`,
        `ALTER TABLE ${this.schema.tableName} ADD COLUMN IF NOT EXISTS department VARCHAR(100)`,
        `ALTER TABLE ${this.schema.tableName} ADD COLUMN IF NOT EXISTS passout_year INTEGER`
      ];

      console.log(`🔧 Executing ${alterQueries.length} ALTER TABLE queries...`);

      for (let i = 0; i < alterQueries.length; i++) {
        const query = alterQueries[i];
        const columnName = query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
        console.log(`🔧 Query ${i + 1}: Adding column ${columnName}...`);
        
        try {
          await pool.query(query);
          console.log(`✅ Column added successfully: ${columnName}`);
        } catch (columnError) {
          console.log(`⚠️ Error for column ${columnName}: ${columnError.message}`);
          if (columnError.code === '42701') { // Column already exists
            console.log(`✅ Column already exists: ${columnName}`);
          } else {
            console.error(`❌ Unexpected error adding column ${columnName}:`, columnError);
          }
        }
      }
      
      // Try to add UNIQUE constraint for prn_number separately
      try {
        console.log('🔧 Adding UNIQUE constraint for prn_number...');
        await pool.query(`ALTER TABLE ${this.schema.tableName} ADD CONSTRAINT IF NOT EXISTS unique_prn_number UNIQUE (prn_number)`);
        console.log(`✅ UNIQUE constraint added to prn_number`);
      } catch (constraintError) {
        console.log(`⚠️ UNIQUE constraint error: ${constraintError.message}`);
        if (constraintError.code === '42P07') { // Constraint already exists
          console.log(`✅ UNIQUE constraint already exists for prn_number`);
        } else {
          console.log(`⚠️ Could not add UNIQUE constraint to prn_number: ${constraintError.message}`);
        }
      }
      
      console.log(`✅ addNewColumns() completed successfully!`);
    } catch (error) {
      console.error(`❌ Error in addNewColumns():`, error.message);
      console.error('❌ Full error:', error);
      throw error;
    }
  };

  // Initialize database and create tables
  static async init() {
    try {
      console.log('🔧 Starting User.init()...');
      console.log('🔧 Step 1: Creating table with all columns...');
      await this.createTable();
      console.log('🔧 Step 2: Creating indexes...');
      
      // Create indexes
      const indexQueries = [
        `CREATE INDEX IF NOT EXISTS idx_${this.schema.tableName}_email ON ${this.schema.tableName}(email)`,
        `CREATE INDEX IF NOT EXISTS idx_${this.schema.tableName}_role ON ${this.schema.tableName}(role)`,
        `CREATE INDEX IF NOT EXISTS idx_${this.schema.tableName}_is_approved ON ${this.schema.tableName}(is_approved)`,
        `CREATE INDEX IF NOT EXISTS idx_${this.schema.tableName}_prn_number ON ${this.schema.tableName}(prn_number)`
      ];
      
      for (const indexQuery of indexQueries) {
        await pool.query(indexQuery);
      }
      
      console.log(`✅ Indexes created/verified successfully for ${this.schema.tableName}`);
      console.log('✅ User.init() completed successfully!');
    } catch (error) {
      console.error(`❌ Error initializing ${this.schema.tableName}:`, error.message);
      console.error('❌ Full error details:', error);
      throw error;
    }
  };

  // Create new user
  static async create(userData) {
    const { firstName, lastName, email, password, prnNumber, contactNumber, department, passoutYear, role = 'alumni', isApproved = false, isFirstLogin = true, status = 'inactive' } = userData;

    console.log('User.create() called with data:', {
      firstName,
      lastName,
      email,
      prnNumber,
      contactNumber,
      department,
      passoutYear,
      role,
      isApproved,
      isFirstLogin,
      status
    });

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Build dynamic query based on provided data
    let insertQuery = `
      INSERT INTO ${this.schema.tableName} 
      (first_name, last_name, email, password, role, is_approved, is_first_login, status
    `;
    
    let values = [firstName, lastName, email, hashedPassword, role, isApproved, isFirstLogin, status];
    let paramCount = 8;
    
    // Add optional fields if provided
    if (prnNumber !== undefined && prnNumber !== null && prnNumber !== '') {
      insertQuery += `, prn_number`;
      values.push(prnNumber);
      paramCount++;
    }
    
    if (contactNumber !== undefined && contactNumber !== null && contactNumber !== '') {
      insertQuery += `, contact_number`;
      values.push(contactNumber);
      paramCount++;
    }
    
    if (department !== undefined && department !== null && department !== '') {
      insertQuery += `, department`;
      values.push(department);
      paramCount++;
    }
    
    if (passoutYear !== undefined && passoutYear !== null && passoutYear !== '') {
      insertQuery += `, passout_year`;
      values.push(parseInt(passoutYear)); // Convert to integer
      paramCount++;
    }
    
    insertQuery += `) VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')})`;
    
    // Build RETURNING clause
    insertQuery += ` RETURNING id, first_name, last_name, email, role, is_approved, created_at`;
    if (prnNumber !== undefined && prnNumber !== null && prnNumber !== '') {
      insertQuery += `, prn_number`;
    }
    if (contactNumber !== undefined && contactNumber !== null && contactNumber !== '') {
      insertQuery += `, contact_number`;
    }
    if (department !== undefined && department !== null && department !== '') {
      insertQuery += `, department`;
    }
    if (passoutYear !== undefined && passoutYear !== null && passoutYear !== '') {
      insertQuery += `, passout_year`;
    }
    insertQuery += `, updated_at`;
    
    console.log('🔧 Executing INSERT with values:', [
      firstName, 
      lastName, 
      email, 
      '***hashed***', 
      role, 
      isApproved,
      prnNumber || 'NULL',
      contactNumber || 'NULL',
      department || 'NULL',
      passoutYear || 'NULL'
    ]);
    
    const result = await pool.query(insertQuery, values);
    
    console.log('✅ User created successfully:', {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
      prn_number: result.rows[0].prn_number,
      contact_number: result.rows[0].contact_number,
      department: result.rows[0].department,
      passout_year: result.rows[0].passout_year
    });

    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = `
      SELECT id, first_name, last_name, email, password, prn_number, contact_number, department, passout_year, role, is_approved, is_first_login, status, created_at, updated_at
      FROM ${this.schema.tableName}
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Find user by ID
  static async findById(id) {
    const query = `
      SELECT id, first_name, last_name, email, prn_number, contact_number, department, passout_year, role, is_approved, is_first_login, status, created_at, updated_at
      FROM ${this.schema.tableName}
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Check if email exists
  static async emailExists(email) {
    const query = `SELECT id FROM ${this.schema.tableName} WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }

  // Update user
  static async update(id, updateData) {
    const allowedFields = ['first_name', 'last_name', 'email', 'password', 'is_first_login', 'status', 'is_approved'];
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Process each field
    for (const field of Object.keys(updateData)) {
      if (allowedFields.includes(field)) {
        if (field === 'password') {
          // Hash the password before updating
          const hashedPassword = await bcrypt.hash(updateData[field], 10);
          updates.push(`${field} = $${paramIndex}`);
          values.push(hashedPassword);
        } else {
          updates.push(`${field} = $${paramIndex}`);
          values.push(updateData[field]);
        }
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE ${this.schema.tableName}
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, first_name, last_name, email, password, role, is_approved, is_first_login, status, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Get all users with pagination
  static async findAll(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (filters.role) {
      conditions.push(`role = $${paramIndex}`);
      values.push(filters.role);
      paramIndex++;
    }

    if (filters.is_approved !== undefined) {
      conditions.push(`is_approved = $${paramIndex}`);
      values.push(filters.is_approved);
      paramIndex++;
    }

    if (filters.search) {
      conditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex + 1} OR email ILIKE $${paramIndex + 2})`);
      values.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      paramIndex += 3;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countQuery = `SELECT COUNT(*) FROM ${this.schema.tableName} ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Data query
    const dataQuery = `
      SELECT id, first_name, last_name, email, role, is_approved, created_at, updated_at
      FROM ${this.schema.tableName} ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);

    const result = await pool.query(dataQuery, values);

    return {
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Delete user with cascade deletion of related data
  static async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      console.log('🗑️ Starting cascade deletion for user:', id);
      
      // Delete related data in correct order to respect foreign key constraints
      
      // 1. Delete event registrations
      const eventRegistrationsResult = await client.query(
        'DELETE FROM event_registrations WHERE user_id = $1 RETURNING id',
        [id]
      );
      console.log('📅 Deleted event registrations:', eventRegistrationsResult.rowCount);
      
      // 2. Delete job applications
      const applicationsResult = await client.query(
        'DELETE FROM applications WHERE user_id = $1 RETURNING id',
        [id]
      );
      console.log('💼 Deleted applications:', applicationsResult.rowCount);
      
      // 3. Delete gallery uploads
      const galleryResult = await client.query(
        'DELETE FROM gallery WHERE user_id = $1 RETURNING id',
        [id]
      );
      console.log('🖼️ Deleted gallery items:', galleryResult.rowCount);
      
      // 4. Delete experience records
      const experienceResult = await client.query(
        'DELETE FROM experience WHERE user_id = $1 RETURNING id',
        [id]
      );
      console.log('💼 Deleted experience records:', experienceResult.rowCount);
      
      // 5. Delete notifications
      const notificationsResult = await client.query(
        'DELETE FROM notifications WHERE user_id = $1 RETURNING id',
        [id]
      );
      console.log('🔔 Deleted notifications:', notificationsResult.rowCount);
      
      // 6. Finally delete the user
      const userResult = await client.query(
        `DELETE FROM ${this.schema.tableName} WHERE id = $1 RETURNING id`,
        [id]
      );
      
      console.log('👤 Deleted user:', userResult.rowCount > 0 ? 'success' : 'failed');
      
      await client.query('COMMIT');
      return userResult.rowCount > 0;
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error during cascade deletion:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update approval status
  static async updateApprovalStatus(id, isApproved) {
    const query = `
      UPDATE ${this.schema.tableName}
      SET is_approved = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, first_name, last_name, email, role, is_approved
    `;

    const result = await pool.query(query, [isApproved, id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Verify password
  static async hashPassword(plainPassword) {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE is_approved = true) as approved_users,
        COUNT(*) FILTER (WHERE is_approved = false) as pending_users,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_users
      FROM ${this.schema.tableName}
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  // Get pending alumni
  static async getPendingAlumni() {
    const query = `
      SELECT id, first_name, last_name, email, prn_number, contact_number, department, passout_year, created_at
      FROM ${this.schema.tableName}
      WHERE role = 'alumni' AND is_approved = false
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Get pending alumni by department (for coordinators)
  static async getPendingAlumniByDepartment(department) {
    console.log(`Fetching pending alumni for department: "${department}"`);
    
    // First, let's check what departments exist for alumni
    const deptQuery = `
      SELECT DISTINCT department, COUNT(*) as count
      FROM ${this.schema.tableName}
      WHERE role = 'alumni'
      GROUP BY department
    `;
    
    const deptResult = await pool.query(deptQuery);
    console.log(`All departments with alumni:`, deptResult.rows);
    
    // Now check all alumni in this department (case-insensitive)
    const debugQuery = `
      SELECT id, first_name, last_name, email, role, is_approved, department, created_at
      FROM ${this.schema.tableName}
      WHERE LOWER(department) = LOWER($1) AND role = 'alumni'
      ORDER BY created_at DESC
    `;
    
    const debugResult = await pool.query(debugQuery, [department]);
    console.log(`All alumni in "${department}" department (case-insensitive):`, debugResult.rows);
    
    // Check approval status distribution
    const statusQuery = `
      SELECT is_approved, COUNT(*) as count
      FROM ${this.schema.tableName}
      WHERE LOWER(department) = LOWER($1) AND role = 'alumni'
      GROUP BY is_approved
    `;
    
    const statusResult = await pool.query(statusQuery, [department]);
    console.log(`Approval status distribution in "${department}":`, statusResult.rows);
    
    // Now get pending users with case-insensitive department and inclusive conditions
    const query = `
      SELECT id, first_name, last_name, email, prn_number, contact_number, department, passout_year, created_at
      FROM ${this.schema.tableName}
      WHERE role = 'alumni' AND (is_approved = false OR is_approved IS NULL) AND LOWER(department) = LOWER($1)
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [department]);
    console.log(`Pending alumni in "${department}" department:`, result.rows);
    return result.rows;
  }

  // Get all users by department (for coordinators)
  static async getAllUsersByDepartment(department) {
    const query = `
      SELECT id, first_name, last_name, email, prn_number, contact_number, department, passout_year, role, is_approved, created_at
      FROM ${this.schema.tableName}
      WHERE department = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [department]);
    return result.rows;
  }

  
  // Get all users with pagination and filters
  static async getAllUsers({ page = 1, limit = 10, role, isApproved } = {}) {
    let query = `
      SELECT id, first_name, last_name, email, role, is_approved, created_at, updated_at
      FROM ${this.schema.tableName}
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (role) {
      query += ` AND role = $${paramIndex++}`;
      params.push(role);
    }
    
    if (isApproved !== undefined) {
      query += ` AND is_approved = $${paramIndex++}`;
      params.push(isApproved);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    const offset = (page - 1) * limit;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM ${this.schema.tableName} WHERE 1=1`;
    const countParams = [];
    let countParamIndex = 1;
    
    if (role) {
      countQuery += ` AND role = $${countParamIndex++}`;
      countParams.push(role);
    }
    
    if (isApproved !== undefined) {
      countQuery += ` AND is_approved = $${countParamIndex++}`;
      countParams.push(isApproved);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    return {
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE is_approved = true) as approved_users,
        COUNT(*) FILTER (WHERE is_approved = false) as pending_users,
        COUNT(*) FILTER (WHERE role = 'alumni') as total_alumni,
        COUNT(*) FILTER (WHERE role = 'alumni' AND is_approved = true) as approved_alumni,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_registrations,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as monthly_registrations
      FROM ${this.schema.tableName}
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
}

export default User;
