// Email Controller - Production Ready API Endpoints
import emailService from '../services/emailService.js';
import { isValidEmail, isValidTemplate } from '../utils/emailValidator.js';
import { getQueueStats, pauseQueue, resumeQueue, clearQueue } from '../services/emailQueueService.js';

// Send single email
export const sendSingleEmail = async (req, res) => {
  try {
    const { to, subject, htmlContent, options = {} } = req.body;

    // Validation
    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, htmlContent'
      });
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Send email via queue
    const result = await emailService.sendCustomEmail(to, subject, htmlContent, options);

    res.status(200).json({
      success: true,
      message: 'Email queued successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Send single email failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};

// Send bulk emails
export const sendBulkEmails = async (req, res) => {
  try {
    const { recipients, subject, htmlContent, options = {} } = req.body;

    // Validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required and cannot be empty'
      });
    }

    if (!subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: subject, htmlContent'
      });
    }

    // Validate all email addresses
    const invalidEmails = recipients.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email addresses found',
        invalidEmails
      });
    }

    // Send bulk emails via queue
    const result = await emailService.sendBulkEmails(recipients, subject, htmlContent, options);

    res.status(200).json({
      success: true,
      message: 'Bulk emails queued successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Send bulk emails failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk emails',
      error: error.message
    });
  }
};

// Send template-based email
export const sendTemplateEmail = async (req, res) => {
  try {
    const { template, to, data, options = {} } = req.body;

    // Validation
    if (!template || !to || !data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: template, to, data'
      });
    }

    if (!isValidTemplate(template)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template type',
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
        ]
      });
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Send template email
    let result;
    switch (template) {
      case 'registration-pending':
        result = await emailService.sendRegistrationPendingEmail(to, data.userName);
        break;
      
      case 'account-approved':
        result = await emailService.sendAccountApprovedEmail(to, data.userName, data.loginUrl);
        break;
      
      case 'account-rejected':
        result = await emailService.sendAccountRejectedEmail(to, data.userName, data.rejectionReason);
        break;
      
      case 'account-created':
        result = await emailService.sendAccountCreatedEmail(to, data.userName, data.userEmail, data.temporaryPassword, data.loginUrl);
        break;
      
      case 'coordinator-account-created':
        result = await emailService.sendCoordinatorAccountCreatedEmail(to, data.userName, data.userEmail, data.temporaryPassword, data.loginUrl);
        break;
      
      case 'otp':
        result = await emailService.sendOTPEmail(to, data.userName, data.otp, data.purpose);
        break;
      
      case 'content-approved':
        result = await emailService.sendContentApprovedEmail(to, data.userName, data.contentType, data.contentTitle, data.contentUrl);
        break;
      
      case 'content-notification':
        result = await emailService.sendContentNotificationEmail(to, data.userName, data.contentType, data.contentData, data.contentUrl);
        break;
      
      case 'news-notification':
        result = await emailService.sendNewsNotificationEmail(to, data.userName, data.newsData, data.newsUrl);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Template not implemented'
        });
    }

    res.status(200).json({
      success: true,
      message: 'Template email queued successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Send template email failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send template email',
      error: error.message
    });
  }
};

// Get queue statistics
export const getQueueStatistics = async (req, res) => {
  try {
    const stats = await getQueueStats();
    
    res.status(200).json({
      success: true,
      message: 'Queue statistics retrieved successfully',
      data: stats.data
    });

  } catch (error) {
    console.error('❌ Get queue statistics failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue statistics',
      error: error.message
    });
  }
};

// Pause email queue
export const pauseEmailQueue = async (req, res) => {
  try {
    const result = await pauseQueue();
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });

  } catch (error) {
    console.error('❌ Pause queue failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to pause queue',
      error: error.message
    });
  }
};

// Resume email queue
export const resumeEmailQueue = async (req, res) => {
  try {
    const result = await resumeQueue();
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });

  } catch (error) {
    console.error('❌ Resume queue failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to resume queue',
      error: error.message
    });
  }
};

// Clear email queue
export const clearEmailQueue = async (req, res) => {
  try {
    const result = await clearQueue();
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });

  } catch (error) {
    console.error('❌ Clear queue failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clear queue',
      error: error.message
    });
  }
};

// Email service health check
export const healthCheck = async (req, res) => {
  try {
    const health = await emailService.healthCheck();
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.status === 'healthy',
      message: health.status === 'healthy' ? 'Email service is healthy' : 'Email service is unhealthy',
      data: health
    });

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
};

// Get email service status
export const getServiceStatus = async (req, res) => {
  try {
    const status = emailService.getStatus();
    
    res.status(200).json({
      success: true,
      message: 'Service status retrieved successfully',
      data: status
    });

  } catch (error) {
    console.error('❌ Get service status failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get service status',
      error: error.message
    });
  }
};

// Test email endpoint (for development/testing)
export const testEmail = async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required for test'
      });
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Send test email
    const result = await emailService.sendCustomEmail(
      to,
      'APCOER Alumni Portal - Test Email',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1A3A5C;">📧 Test Email</h2>
          <p>This is a test email from the APCOER Alumni Portal email service.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Service Status:</strong> ✅ Working</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            This is an automated test message. If you received this email, the email service is working correctly.
          </p>
        </div>
      `,
      {
        priority: 5,
        category: 'test'
      }
    );

    res.status(200).json({
      success: true,
      message: 'Test email queued successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};

export default {
  sendSingleEmail,
  sendBulkEmails,
  sendTemplateEmail,
  getQueueStatistics,
  pauseEmailQueue,
  resumeEmailQueue,
  clearEmailQueue,
  healthCheck,
  getServiceStatus,
  testEmail
};
