#!/usr/bin/env node

// Manual admin user creation script
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database.js';

// Load environment variables
dotenv.config();

console.log('🔧 Creating admin user manually...');

const adminEmail = 'admin@APCOER.com';
const adminPassword = '@MrRoya02';
const adminFirstName = 'Rahul';
const adminLastName = 'Kale';

async function createAdmin() {
  try {
    // Delete existing admin users
    await pool.query('DELETE FROM users WHERE role = $1', ['admin']);
    console.log('🗑️ Removed existing admin users');

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    console.log('🔐 Password hashed successfully');

    // Insert new admin user
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, is_approved, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, email, role, first_name, last_name`,
      [adminFirstName, adminLastName, adminEmail, hashedPassword, 'admin', true]
    );

    console.log('✅ Admin user created successfully:');
    console.log('  - Email:', adminEmail);
    console.log('  - Password:', adminPassword);
    console.log('  - Name:', adminFirstName, adminLastName);
    console.log('  - Role: admin');
    console.log('  - ID:', result.rows[0].id);

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
