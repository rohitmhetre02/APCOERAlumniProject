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
import Notification from './src/models/Notification.js';
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
    
    // Initialize profile tables
    await initializeAllTables();
    
    // Initialize notification system
    
    await Notification.init();
    
    // Initialize Event system
  
    await Event.createTable();
    
    // Initialize News system
    
    await News.createTable();
    
    // Initialize Opportunity system
    
    await Opportunity.createTable();
    
    // Initialize Application system
    
    await Application.createTable();
    
    // Initialize Event Registration system
    
    await EventRegistration.createTable();
    
    // Initialize Socket.IO
   
    initializeSocket(server);
    
    // Test email configuration
   
    const emailConfigOk = await testEmailConfig();
    if (emailConfigOk) {
     
    } else {
      console.log('⚠️  Email service not configured properly');
    }
    
    // Ensure admin user exists
   
    await ensureAdminExists();
    
    // Ensure coordinator user exists
    
    await ensureCoordinatorExists();
    
    // Start notification cleanup
   
    const { scheduleNotificationCleanup } = await import('./src/controllers/notificationController.js');
    scheduleNotificationCleanup();
    
    // Start server
    server.listen(PORT, () => {
     
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();