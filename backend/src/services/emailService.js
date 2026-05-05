// Email Service - Production Ready Queue-Based Service
import { addEmailToQueue, addBulkEmailsToQueue } from './emailQueueService.js';
import {
  getRegistrationPendingTemplate,
  getAccountApprovedTemplate,
  getAccountRejectedTemplate,
  getAccountCreatedTemplate,
  getCoordinatorAccountCreatedTemplate,
  getOTPTemplate,
  getContentApprovedTemplate,
  getContentNotificationTemplate,
  getNewsNotificationTemplate
} from '../utils/emailTemplates.js';

// Service wrapper for all email operations
class EmailService {
  constructor() {
    this.initialized = false;
  }

  // Initialize email service
  async initialize() {
    try {
      console.log(' Initializing Email Service...');
      this.initialized = true;
      console.log(' Email Service initialized successfully');
    } catch (error) {
      console.error(' Failed to initialize Email Service:', error.message);
      throw error;
    }
  }

  // Send registration pending email
  async sendRegistrationPendingEmail(to, userName) {
    try {
      const template = getRegistrationPendingTemplate(userName);
      console.log('📧 Adding email to queue...');
      const result = await addEmailToQueue(to, template.subject, template.html, {
        priority: 3,
        category: 'registration'
      });
      console.log('✅ Email added to queue successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to queue email, trying direct send:', error.message);
      
      // Fallback: Try direct email sending
      try {
        console.log('📧 Attempting direct email send...');
        const template = getRegistrationPendingTemplate(userName);
        await sendCustomEmail(to, template.subject, template.html);
        console.log('✅ Email sent directly (fallback method)');
        return { status: 'sent_directly', method: 'direct' };
      } catch (directError) {
        console.error('❌ Direct email send also failed:', directError.message);
        throw new Error(`Email failed: Queue error - ${error.message}, Direct error - ${directError.message}`);
      }
    }
  }

  // Send account approved email
  async sendAccountApprovedEmail(to, userName, loginUrl = null) {
    try {
      const template = getAccountApprovedTemplate(userName, loginUrl);
      return await addEmailToQueue(to, template.subject, template.html, {
        priority: 4,
        category: 'approval'
      });
    } catch (error) {
      console.error(' Failed to send account approved email:', error.message);
      throw error;
    }
  }

  // Send account rejected email
  async sendAccountRejectedEmail(to, userName, rejectionReason = null) {
    try {
      const template = getAccountRejectedTemplate(userName, rejectionReason);
      return await addEmailToQueue(to, template.subject, template.html, {
        priority: 3,
        category: 'rejection'
      });
    } catch (error) {
      console.error(' Failed to send account rejected email:', error.message);
      throw error;
    }
  }

  // Send account created email (admin-added alumni)
  async sendAccountCreatedEmail(to, userName, userEmail, temporaryPassword = null, loginUrl = null) {
    try {
      const template = getAccountCreatedTemplate(userName, userEmail, temporaryPassword, loginUrl);
      return await addEmailToQueue(to, template.subject, template.html, {
        priority: 4,
        category: 'account-creation'
      });
    } catch (error) {
      console.error(' Failed to send account created email:', error.message);
      throw error;
    }
  }

  // Send coordinator account created email
  async sendCoordinatorAccountCreatedEmail(to, userName, userEmail, temporaryPassword = null, loginUrl = null) {
    try {
      const template = getCoordinatorAccountCreatedTemplate(userName, userEmail, temporaryPassword, loginUrl);
      return await addEmailToQueue(to, template.subject, template.html, {
        priority: 5,
        category: 'coordinator-creation'
      });
    } catch (error) {
      console.error(' Failed to send coordinator account created email:', error.message);
      throw error;
    }
  }

  // Send OTP email (for verification or password reset)
  async sendOTPEmail(to, userName, otp, purpose = 'verification') {
    try {
      const template = getOTPTemplate(userName, otp, purpose);
      return await addEmailToQueue(to, template.subject, template.html, {
        priority: 5,
        category: 'otp',
        delay: 0
      });
    } catch (error) {
      console.error(' Failed to send OTP email:', error.message);
      throw error;
    }
  }

  // Send content approved email (events/opportunities)
  async sendContentApprovedEmail(to, userName, contentType, contentTitle, contentUrl = null) {
    try {
      const template = getContentApprovedTemplate(userName, contentType, contentTitle, contentUrl);
      return await addEmailToQueue(to, template.subject, template.html, {
        priority: 3,
        category: 'content-approval'
      });
    } catch (error) {
      console.error(' Failed to send content approved email:', error.message);
      throw error;
    }
  }

  // Send content notification email (new events/opportunities)
  async sendContentNotificationEmail(to, userName, contentType, contentData, contentUrl = null) {
    try {
      const template = getContentNotificationTemplate(userName, contentType, contentData, contentUrl);
      return await addEmailToQueue(to, template.subject, template.html, {
        priority: 2,
        category: 'content-notification'
      });
    } catch (error) {
      console.error(' Failed to send content notification email:', error.message);
      throw error;
    }
  }

  // Send news notification email
  async sendNewsNotificationEmail(to, userName, newsData, newsUrl = null) {
    try {
      const template = getNewsNotificationTemplate(userName, newsData, newsUrl);
      return await addEmailToQueue(to, template.subject, template.html, {
        priority: 2,
        category: 'news-notification'
      });
    } catch (error) {
      console.error(' Failed to send news notification email:', error.message);
      throw error;
    }
  }

  // Send bulk emails (for notifications to multiple recipients)
  async sendBulkEmails(recipients, subject, htmlContent, options = {}) {
    try {
      console.log(` Sending bulk email to ${recipients.length} recipients`);
      return await addBulkEmailsToQueue(recipients, subject, htmlContent, {
        priority: 1, // Lower priority for bulk
        category: 'bulk',
        ...options
      });
    } catch (error) {
      console.error(' Failed to send bulk emails:', error.message);
      throw error;
    }
  }

  // Send custom email (for admin or special cases)
  async sendCustomEmail(to, subject, htmlContent, options = {}) {
    try {
      return await addEmailToQueue(to, subject, htmlContent, {
        priority: 3,
        category: 'custom',
        ...options
      });
    } catch (error) {
      console.error(' Failed to send custom email:', error.message);
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    try {
      if (!this.initialized) {
        return {
          status: 'unhealthy',
          error: 'Email service not initialized',
          timestamp: new Date().toISOString()
        };
      }

      // Test queue connectivity
      const { healthCheck } = await import('./emailQueueService.js');
      const queueHealth = await healthCheck();

      return {
        status: queueHealth.status,
        service: 'Email Service',
        queue: queueHealth,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get service status
  getStatus() {
    return {
      initialized: this.initialized,
      availableTemplates: [
        'registration-pending',
        'account-approved',
        'account-rejected',
        'account-created',
        'coordinator-account-created',
        'otp',
        'content-approved',
        'content-notification',
        'news-notification'
      ],
      supportedOperations: [
        'single-email',
        'bulk-email',
        'custom-email'
      ]
    };
  }
}

// Create and export singleton instance
const emailService = new EmailService();

export default emailService;

// Export individual methods for backward compatibility
export const {
  sendRegistrationPendingEmail,
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendAccountCreatedEmail,
  sendCoordinatorAccountCreatedEmail,
  sendOTPEmail,
  sendContentApprovedEmail,
  sendContentNotificationEmail,
  sendNewsNotificationEmail,
  sendBulkEmails,
  sendCustomEmail,
  healthCheck,
  getStatus
} = emailService;
