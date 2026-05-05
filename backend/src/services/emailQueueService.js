// Email Queue Service - Production Ready with BullMQ
import { Queue, Worker, FlowProducer } from 'bullmq';
import { redisConfig, queueConfig, emailConfig } from '../config/emailConfig.js';
import emailProviderFactory from './emailProviders/emailProviderFactory.js';

// Use direct Redis configuration for BullMQ (let BullMQ manage connections)
const connectionOptions = {
  connection: redisConfig
};

// Email queue
let emailQueue = null;
let emailWorker = null;
let flowProducer = null;

// Initialize email provider
let emailProvider = null;

// Rate limiting state
const rateLimiter = {
  tokens: parseInt(process.env.EMAIL_RATE_LIMIT_PER_SECOND) || 10,
  lastRefill: Date.now(),
  refillRate: parseInt(process.env.EMAIL_RATE_LIMIT_PER_SECOND) || 10 // tokens per second
};

// Initialize email queue
export const initializeEmailQueue = async () => {
  try {
    console.log('🚀 Initializing email queue system...');
    
    // Initialize email provider
    emailProvider = await emailProviderFactory.initializeProvider(
      emailConfig.provider, 
      emailConfig
    );
    
    // Create email queue with error handling
    try {
      emailQueue = new Queue(queueConfig.name, {
        ...connectionOptions,
        defaultJobOptions: queueConfig.defaultJobOptions
      });
    } catch (queueError) {
      console.error('❌ Failed to create email queue:', queueError.message);
      throw queueError;
    }

    // FlowProducer disabled to prevent Redis timeout issues
    // FlowProducer is optional for basic email functionality
    console.log('⚠️ FlowProducer disabled for stability');

    // Queue event handlers
    emailQueue.on('error', (err) => {
      console.error('❌ Email queue error:', err.message);
      console.error('❌ Queue error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
    });

    emailQueue.on('waiting', (job) => {
      console.log(`⏳ Job ${job.id} waiting in queue`);
    });

    emailQueue.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed successfully`);
    });

    emailQueue.on('failed', (job, err) => {
      console.error(`❌ Job ${job.id} failed:`, err.message);
    });

    emailQueue.on('stalled', (job) => {
      console.warn(`⚠️ Job ${job.id} stalled`);
    });

    console.log('✅ Email queue initialized successfully');
    return emailQueue;

  } catch (error) {
    console.error('❌ Failed to initialize email queue:', error.message);
    throw error;
  }
};

// Rate limiting function
const acquireRateLimitToken = async () => {
  const now = Date.now();
  const timePassed = (now - rateLimiter.lastRefill) / 1000;
  
  // Refill tokens based on time passed
  const tokensToAdd = Math.floor(timePassed * rateLimiter.refillRate);
  rateLimiter.tokens = Math.min(
    rateLimiter.tokens + tokensToAdd,
    rateLimiter.refillRate * 2 // Allow some burst capacity
  );
  rateLimiter.lastRefill = now;

  if (rateLimiter.tokens <= 0) {
    const waitTime = 1000 / rateLimiter.refillRate; // Time to wait for next token
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return acquireRateLimitToken(); // Retry after waiting
  }

  rateLimiter.tokens--;
  return true;
};

// Add single email to queue
export const addEmailToQueue = async (to, subject, htmlContent, options = {}) => {
  try {
    console.log('📧 addEmailToQueue called with:', { to, subject, options });
    
    if (!emailQueue) {
      console.error('❌ Email queue is null/undefined');
      throw new Error('Email queue not initialized. Call initializeEmailQueue() first.');
    }

    console.log('✅ Email queue exists, preparing job data...');
    
    const jobData = {
      type: 'single',
      to: Array.isArray(to) ? to : [to],
      subject,
      htmlContent,
      options: {
        priority: options.priority || 5,
        delay: options.delay || 0,
        attempts: options.attempts || 3,
        ...options
      },
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    console.log('📧 Adding job to queue...');
    const job = await emailQueue.add('send-email', jobData, {
      priority: options.priority || 5,
      delay: options.delay || 0,
      attempts: options.attempts || 3
    });

    console.log(`✅ Email job added to queue: ${job.id}`);
    return {
      success: true,
      jobId: job.id,
      message: 'Email queued successfully'
    };

  } catch (error) {
    console.error('❌ Failed to add email to queue:', error.message);
    throw error;
  }
};

// Add bulk emails to queue
export const addBulkEmailsToQueue = async (emails, subject, htmlContent, options = {}) => {
  try {
    if (!emailQueue) {
      throw new Error('Email queue not initialized. Call initializeEmailQueue() first.');
    }

    console.log(`📧 Adding bulk email job for ${emails.length} recipients`);

    const jobData = {
      type: 'bulk',
      emails,
      subject,
      htmlContent,
      options: {
        batchSize: options.batchSize || 100,
        delayBetweenBatches: options.delayBetweenBatches || 1000,
        ...options
      },
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    const job = await emailQueue.add('send-bulk-email', jobData, {
      priority: options.priority || 3, // Lower priority for bulk emails
      delay: options.delay || 0,
      attempts: options.attempts || 2 // Fewer retries for bulk
    });

    console.log(`📧 Bulk email job added to queue: ${job.id}`);
    return {
      success: true,
      jobId: job.id,
      totalEmails: emails.length,
      message: 'Bulk email queued successfully'
    };

  } catch (error) {
    console.error('❌ Failed to add bulk email to queue:', error.message);
    throw error;
  }
};

// Process email job
export const processEmailJob = async (job) => {
  try {
    const { type, to, subject, htmlContent, options } = job.data;
    
    console.log(`📧 Processing email job ${job.id} of type: ${type}`);

    // Apply rate limiting
    await acquireRateLimitToken();

    let result;

    switch (type) {
      case 'single':
        result = await emailProvider.sendEmail(to, subject, htmlContent, options);
        break;
      
      case 'bulk':
        result = await emailProvider.sendBulkEmails(to, subject, htmlContent, options);
        break;
      
      default:
        throw new Error(`Unknown email job type: ${type}`);
    }

    console.log(`✅ Email job ${job.id} processed successfully`);
    return result;

  } catch (error) {
    console.error(`❌ Email job ${job.id} failed:`, error.message);
    
    // Add retry information
    job.data.retryCount = (job.data.retryCount || 0) + 1;
    
    throw error;
  }
};

// Initialize email worker
export const initializeEmailWorker = async () => {
  try {
    console.log('👷 Initializing email worker...');

    if (emailWorker) {
      console.log('⚠️ Email worker already exists, stopping existing worker...');
      await emailWorker.close();
    }

    emailWorker = new Worker(
      queueConfig.name,
      async (job) => {
        try {
          const result = await processEmailJob(job);
          return result;
        } catch (error) {
          console.error(`❌ Worker job ${job.id} failed:`, error.message);
          throw error;
        }
      },
      {
        ...connectionOptions,
        concurrency: queueConfig.worker.concurrency,
        limiter: queueConfig.worker.limiter,
        stalledInterval: queueConfig.settings.stalledInterval,
        maxStalledCount: queueConfig.settings.maxStalledCount
      }
    );

    // Worker event handlers
    emailWorker.on('error', (err) => {
      console.error('❌ Email worker error:', err.message);
    });

    emailWorker.on('completed', (job) => {
      console.log(`✅ Worker completed job ${job.id}`);
    });

    emailWorker.on('failed', (job, err) => {
      console.error(`❌ Worker failed job ${job.id}:`, err.message);
    });

    emailWorker.on('stalled', (job) => {
      console.warn(`⚠️ Worker stalled job ${job.id}`);
    });

    console.log(`✅ Email worker initialized with concurrency: ${queueConfig.worker.concurrency}`);
    return emailWorker;

  } catch (error) {
    console.error('❌ Failed to initialize email worker:', error.message);
    throw error;
  }
};

// Get queue statistics
export const getQueueStats = async () => {
  try {
    if (!emailQueue) {
      throw new Error('Email queue not initialized');
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaiting(),
      emailQueue.getActive(),
      emailQueue.getCompleted(),
      emailQueue.getFailed(),
      emailQueue.getDelayed()
    ]);

    const stats = {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      rateLimit: emailProvider ? emailProvider.getRateLimitStatus() : null,
      worker: {
        concurrency: queueConfig.worker.concurrency,
        rateLimit: queueConfig.worker.limiter
      }
    };

    return {
      success: true,
      data: stats
    };

  } catch (error) {
    console.error('❌ Failed to get queue stats:', error.message);
    throw error;
  }
};

// Queue management functions
export const pauseQueue = async () => {
  try {
    if (!emailQueue) {
      throw new Error('Email queue not initialized');
    }

    await emailQueue.pause();
    console.log('⏸️ Email queue paused');
    return { success: true, message: 'Email queue paused successfully' };

  } catch (error) {
    console.error('❌ Failed to pause queue:', error.message);
    throw error;
  }
};

export const resumeQueue = async () => {
  try {
    if (!emailQueue) {
      throw new Error('Email queue not initialized');
    }

    await emailQueue.resume();
    console.log('▶️ Email queue resumed');
    return { success: true, message: 'Email queue resumed successfully' };

  } catch (error) {
    console.error('❌ Failed to resume queue:', error.message);
    throw error;
  }
};

export const clearQueue = async () => {
  try {
    if (!emailQueue) {
      throw new Error('Email queue not initialized');
    }

    await emailQueue.clean(0, 'completed');
    await emailQueue.clean(0, 'failed');
    await emailQueue.drain();
    
    console.log('🧹 Email queue cleared');
    return { success: true, message: 'Email queue cleared successfully' };

  } catch (error) {
    console.error('❌ Failed to clear queue:', error.message);
    throw error;
  }
};

// Graceful shutdown
export const shutdownEmailQueue = async () => {
  try {
    console.log('🛑 Shutting down email queue system...');

    if (emailWorker) {
      await emailWorker.close();
      console.log('✅ Email worker closed');
    }

    if (emailQueue) {
      await emailQueue.close();
      console.log('✅ Email queue closed');
    }

    
    console.log('✅ Email queue system shut down successfully');
    return true;

  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const stats = await getQueueStats();
    const connectionTest = await emailProvider.testConnection();
    
    return {
      status: 'healthy',
      queue: stats.data,
      provider: connectionTest,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  initializeEmailQueue,
  initializeEmailWorker,
  addEmailToQueue,
  addBulkEmailsToQueue,
  processEmailJob,
  getQueueStats,
  pauseQueue,
  resumeQueue,
  clearQueue,
  shutdownEmailQueue,
  healthCheck
};
