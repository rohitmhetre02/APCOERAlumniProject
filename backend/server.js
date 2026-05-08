// server.js
import { createServer } from 'http';
import app from './src/app.js';
import { connectDB } from './src/config/database.js';
import { initializeAllTables } from './src/models/index.js';
import { ensureAdminExists } from './src/middleware/adminMiddleware.js';
import { initializeSocket } from './src/config/socket.js';
import User from './src/models/User.js';
import Event from './src/models/Event.js';
import News from './src/models/News.js';
import Opportunity from './src/models/Opportunity.js';
import Application from './src/models/Application.js';
import EventRegistration from './src/models/EventRegistration.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = createServer(app);

// Global error handlers for Redis/BullMQ issues
process.on('uncaughtException', (error) => {
  if (error.message.includes('Command timed out') || error.message.includes('ECONNRESET')) {
    console.warn('⚠️ Redis connection issue handled gracefully:', error.message);
    return; // Don't crash the server
  }
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  if (reason instanceof Error && (reason.message.includes('Command timed out') || reason.message.includes('ECONNRESET'))) {
    console.warn('⚠️ Redis connection issue handled gracefully:', reason.message);
    return; // Don't crash the server
  }
  console.error('💥 Unhandled Rejection:', reason);
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Initialize database tables and run migrations
    await User.init();
    await initializeAllTables();
    await Event.createTable();
    await News.createTable();
    await Opportunity.createTable();
    await Application.createTable();
    await EventRegistration.createTable();
    
    // Initialize Socket.IO
    const io = initializeSocket(server);
    app.set('io', io);
    
    // Initialize Email Queue for main server
    try {
      console.log('📧 Initializing email queue...');
      const { initializeEmailQueue } = await import('./src/services/emailQueueService.js');
      await initializeEmailQueue();
      console.log('✅ Email queue initialized successfully');
    } catch (emailError) {
      console.warn('⚠️ Email queue initialization failed (email worker will handle):', emailError.message);
      console.log('📧 Email functionality will be available when email worker is started');
    }
    
    // Ensure admin user exists
    await ensureAdminExists();
    
    // Start server
    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` API URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();