// Email Configuration - Production Ready
import dotenv from 'dotenv';

dotenv.config();

// Email Configuration for Production
export const emailConfig = {
  provider: process.env.EMAIL_PROVIDER || 'sendgrid',
  
  // SendGrid Configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@apcoer.edu.in',
    fromName: process.env.SENDGRID_FROM_NAME || 'APCOER Alumni Cell',
    dailyLimit: parseInt(process.env.SENDGRID_DAILY_LIMIT) || 95000,
    hourlyLimit: parseInt(process.env.SENDGRID_HOURLY_LIMIT) || 100
  },
  
  // AWS SES Configuration
  ses: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    fromEmail: process.env.SES_FROM_EMAIL || 'noreply@apcoer.edu.in'
  },
  
  // Mailgun Configuration
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    fromEmail: process.env.MAILGUN_FROM_EMAIL || 'noreply@apcoer.edu.in'
  },
  
  // SMTP Configuration (for Test Provider)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    fromEmail: process.env.EMAIL_FROM || '"APCOER Alumni" <noreply@apcoer.edu.in>'
  }
};

// Redis Configuration for Production - Force Local Redis
export const redisConfig = {
  host: '127.0.0.1', // Force localhost
  port: 6379, // Force default Redis port
  password: undefined, // No password for local Redis
  db: 0, // Default database

  maxRetriesPerRequest: null,

  enableOfflineQueue: true,   // ✅ MUST CHANGE
  lazyConnect: false,
  keepAlive: 1,               // ✅ enable keepalive

  connectTimeout: 10000,
  commandTimeout: 10000,

  enableReadyCheck: true,     // ✅ enable

  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  }
};

// Queue Configuration
export const queueConfig = {
  name: 'email-queue',
  
  // Job Options
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 3,           // Retry 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,         // Start with 2 seconds
    },
    // Job priority (1-10, 10 is highest)
    priority: 5,
    // Delay between retries
    delayBetweenRetries: 1000
  },
  
  // Worker Configuration
  worker: {
    concurrency: parseInt(process.env.EMAIL_WORKER_CONCURRENCY) || 5, // Process 5 jobs in parallel
    limiter: {
      max: parseInt(process.env.EMAIL_RATE_LIMIT_PER_SECOND) || 10, // 10 emails per second
      duration: 1000, // per second
      groupKey: 'email-limiter'
    }
  },
  
  // Queue Settings
  settings: {
    stalledInterval: 30000,  // 30 seconds
    maxStalledCount: 1,
    retryProcessDelay: 5000
  }
};

// Rate Limiting Configuration
export const rateLimitConfig = {
  // Provider-specific limits
  sendgrid: {
    dailyLimit: parseInt(process.env.SENDGRID_DAILY_LIMIT) || 100,
    hourlyLimit: parseInt(process.env.SENDGRID_HOURLY_LIMIT) || 1000
  },
  
  ses: {
    perSecondLimit: parseInt(process.env.SES_PER_SECOND_LIMIT) || 14,
    dailyLimit: parseInt(process.env.SES_DAILY_LIMIT) || 50000
  },
  
  mailgun: {
    perSecondLimit: parseInt(process.env.MAILGUN_PER_SECOND_LIMIT) || 10,
    hourlyLimit: parseInt(process.env.MAILGUN_HOURLY_LIMIT) || 1000
  }
};

// Email Validation
export const validateEmailConfig = () => {
  const errors = [];
  
  // Check Redis configuration
  if (!redisConfig.host) {
    errors.push('Redis host is required');
  }
  
  // Check email provider configuration
  const provider = emailConfig.provider;
  if (provider === 'sendgrid' && !emailConfig.sendgrid.apiKey) {
    errors.push('SendGrid API key is required');
  } else if (provider === 'ses' && (!emailConfig.ses.accessKeyId || !emailConfig.ses.secretAccessKey)) {
    errors.push('AWS SES credentials are required');
  } else if (provider === 'mailgun' && (!emailConfig.mailgun.apiKey || !emailConfig.mailgun.domain)) {
    errors.push('Mailgun API key and domain are required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Email configuration errors: ${errors.join(', ')}`);
  }
  
  return true;
};

// Environment Variables Template
export const envTemplate = `
# Email Provider Configuration
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@apcoer.edu.in
SENDGRID_FROM_NAME=APCOER Alumni Portal

# AWS SES Configuration (if using SES)
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
SES_FROM_EMAIL=noreply@apcoer.edu.in

# Mailgun Configuration (if using Mailgun)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_FROM_EMAIL=noreply@apcoer.edu.in

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Queue Configuration
EMAIL_WORKER_CONCURRENCY=5
EMAIL_RATE_LIMIT_PER_SECOND=10

# Rate Limits (Provider-specific)
SENDGRID_DAILY_LIMIT=100
SENDGRID_HOURLY_LIMIT=1000
SES_PER_SECOND_LIMIT=14
SES_DAILY_LIMIT=50000
MAILGUN_PER_SECOND_LIMIT=10
MAILGUN_HOURLY_LIMIT=1000
`;

export default {
  emailConfig,
  redisConfig,
  queueConfig,
  rateLimitConfig,
  validateEmailConfig,
  envTemplate
};
