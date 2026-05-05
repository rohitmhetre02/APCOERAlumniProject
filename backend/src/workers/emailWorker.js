// Email Worker - Production Ready Process
import { initializeEmailQueue, initializeEmailWorker, shutdownEmailQueue } from '../services/emailQueueService.js';

// Worker configuration
const WORKER_CONFIG = {
  gracefulShutdownTimeout: 30000, // 30 seconds
  healthCheckInterval: 60000,     // 1 minute
  maxMemoryUsage: 500 * 1024 * 1024, // 500MB
  crashRestartDelay: 5000         // 5 seconds
};

let isShuttingDown = false;
let healthCheckTimer = null;

// Graceful shutdown handler
const handleGracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    console.log(`⚠️ Shutdown already in progress, ignoring ${signal}`);
    return;
  }

  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);

  try {
    // Stop accepting new jobs
    console.log('📋 Stopping new job acceptance...');
    
    // Clear health check timer
    if (healthCheckTimer) {
      clearInterval(healthCheckTimer);
    }

    // Wait for current jobs to complete or timeout
    console.log(`⏳ Waiting for current jobs to complete (timeout: ${WORKER_CONFIG.gracefulShutdownTimeout}ms)...`);
    
    const shutdownPromise = shutdownEmailQueue();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Shutdown timeout')), WORKER_CONFIG.gracefulShutdownTimeout)
    );

    await Promise.race([shutdownPromise, timeoutPromise]);
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

// Memory monitoring
const monitorMemoryUsage = () => {
  const memoryUsage = process.memoryUsage();
  const memoryMB = memoryUsage.heapUsed / 1024 / 1024;
  
  if (memoryMB > WORKER_CONFIG.maxMemoryUsage / 1024 / 1024) {
    console.warn(`⚠️ High memory usage: ${memoryMB.toFixed(2)}MB`);
    
    // Force garbage collection if available
    if (global.gc) {
      console.log('🗑️ Forcing garbage collection...');
      global.gc();
    }
  }
};

// Health check function
const performHealthCheck = async () => {
  try {
    const { healthCheck } = await import('../services/emailQueueService.js');
    const health = await healthCheck();
    
    if (health.status === 'unhealthy') {
      console.error('❌ Worker health check failed:', health.error);
    } else {
      console.log('💚 Worker health check passed');
    }
    
    // Monitor memory usage
    monitorMemoryUsage();
    
  } catch (error) {
    console.error('❌ Health check error:', error.message);
  }
};

// Error handlers
const handleUncaughtException = (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);
  
  // Attempt graceful shutdown
  handleGracefulShutdown('uncaught-exception');
};

const handleUnhandledRejection = (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Attempt graceful shutdown
  handleGracefulShutdown('unhandled-rejection');
};

// Worker startup
const startWorker = async () => {
  try {
    console.log('🚀 Starting Email Worker...');
    console.log(`📊 Worker Configuration:`, {
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      maxMemory: `${WORKER_CONFIG.maxMemoryUsage / 1024 / 1024}MB`,
      gracefulShutdownTimeout: `${WORKER_CONFIG.gracefulShutdownTimeout}ms`
    });

    // Initialize email queue first
    console.log('👷 Initializing email queue...');
    await initializeEmailQueue();
    
    // Then initialize email worker
    console.log('👷 Initializing email worker...');
    await initializeEmailWorker();
    
    console.log('✅ Email Worker started successfully');
    console.log('📧 Worker is ready to process email jobs...');
    
    // Start health check timer
    healthCheckTimer = setInterval(performHealthCheck, WORKER_CONFIG.healthCheckInterval);
    
    // Initial health check
    await performHealthCheck();
    
    // Worker ready message
    console.log('🎉 Email Worker is running and healthy!');
    console.log('💚 Worker is processing jobs...');
    
  } catch (error) {
    console.error('❌ Failed to start Email Worker:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Restart after delay
    console.log(`🔄 Restarting worker in ${WORKER_CONFIG.crashRestartDelay}ms...`);
    setTimeout(() => {
      process.exit(1); // Will trigger restart if using process manager
    }, WORKER_CONFIG.crashRestartDelay);
  }
};

// Process event listeners
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => handleGracefulShutdown('SIGUSR2')); // For nodemon

process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);

// Handle memory warnings
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('⚠️ MaxListenersExceededWarning detected');
  } else {
    console.warn('⚠️ Process warning:', warning.name, warning.message);
  }
});

// Start the worker
startWorker().catch((error) => {
  console.error('💥 Fatal error starting worker:', error);
  process.exit(1);
});

// Export for testing
export { startWorker, handleGracefulShutdown, performHealthCheck };
