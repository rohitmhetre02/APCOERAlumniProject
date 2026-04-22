import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait when connecting a new client
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Create connection pool
const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
const testConnection = async () => {
  try {
    console.log('🔍 Testing PostgreSQL connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL Connected Successfully');
    console.log(`📊 Database Time: ${result.rows[0].now}`);
    
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('timeout')) {
      console.error('⏰ Connection timeout. Possible solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify the DATABASE_URL is correct');
      console.error('   3. Check if Neon database is active');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('🌐 Network error. Possible solutions:');
      console.error('   1. Check the DATABASE_URL hostname');
      console.error('   2. Verify Neon database is running');
      console.error('   3. Check firewall settings');
    } else if (error.message.includes('authentication')) {
      console.error('🔐 Authentication error. Possible solutions:');
      console.error('   1. Verify database credentials');
      console.error('   2. Check if database user has proper permissions');
    }
    
    return false;
  }
};


// Initialize database connection
const connectDB = async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    process.exit(1);
  }
  
  try {
    // Import User model to create table
    const { default: User } = await import('../models/User.js');
    await User.createTable();
    
    // Import Opportunity model to create table
    console.log('🔧 Initializing Opportunity model...');
    const { default: Opportunity } = await import('../models/Opportunity.js');
    await Opportunity.createTable();
    console.log('✅ Opportunity model initialized');
    
    // Import EventRegistration model to create table
    console.log('🔧 Initializing EventRegistration model...');
    const { default: EventRegistration } = await import('../models/EventRegistration.js');
    await EventRegistration.createTable();
    console.log('✅ EventRegistration model initialized');
    
    console.log('🗄️  Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
let isShuttingDown = false;

const closePool = async () => {
  if (isShuttingDown) {
    console.log('⚠️  Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  
  try {
    console.log('🔄 Closing database connection pool...');
    await pool.end();
    console.log('✅ PostgreSQL connection pool closed');
  } catch (error) {
    if (error.message.includes('Called end on pool more than once')) {
      console.log('ℹ️  Connection pool already closed');
    } else {
      console.error('❌ Error closing connection pool:', error.message);
    }
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT (Ctrl+C). Gracefully shutting down...');
  closePool().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
  closePool().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
});

export { pool, connectDB, testConnection, closePool };
