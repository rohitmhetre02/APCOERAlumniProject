// server.js
import { createServer } from 'http';
import app from './src/app.js';
import { connectDB } from './src/config/database.js';
import { initializeAllTables } from './src/models/index.js';
import { testEmailConfig } from './src/services/emailService.js';
import { ensureAdminExists } from './src/middleware/adminMiddleware.js';
import { ensureCoordinatorExists } from './src/middleware/coordinatorMiddleware.js';
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
    
    // Test email configuration
    await testEmailConfig();
    
    // Ensure admin and coordinator users exist
    await ensureAdminExists();
    await ensureCoordinatorExists();
    
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