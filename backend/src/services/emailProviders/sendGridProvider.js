// SendGrid Email Provider - Production Ready
import sgMail from '@sendgrid/mail';

class SendGridProvider {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.rateLimiter = {
      sentToday: 0,
      sentThisHour: 0,
      lastReset: {
        day: new Date().getDate(),
        hour: new Date().getHours()
      }
    };
  }

  async initialize() {
    try {
      sgMail.setApiKey(this.config.apiKey);
      this.client = sgMail;
      console.log('✅ SendGrid provider initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize SendGrid provider:', error.message);
      throw error;
    }
  }

  async checkRateLimits() {
    const now = new Date();
    const currentDay = now.getDate();
    const currentHour = now.getHours();

    // Reset daily counter if new day
    if (currentDay !== this.rateLimiter.lastReset.day) {
      this.rateLimiter.sentToday = 0;
      this.rateLimiter.lastReset.day = currentDay;
      console.log('📊 Daily SendGrid rate limit reset');
    }

    // Reset hourly counter if new hour
    if (currentHour !== this.rateLimiter.lastReset.hour) {
      this.rateLimiter.sentThisHour = 0;
      this.rateLimiter.lastReset.hour = currentHour;
      console.log('📊 Hourly SendGrid rate limit reset');
    }

    // Check limits
    const { dailyLimit, hourlyLimit } = this.config;
    
    if (this.rateLimiter.sentToday >= dailyLimit) {
      throw new Error(`SendGrid daily limit exceeded: ${this.rateLimiter.sentToday}/${dailyLimit}`);
    }

    if (this.rateLimiter.sentThisHour >= hourlyLimit) {
      throw new Error(`SendGrid hourly limit exceeded: ${this.rateLimiter.sentThisHour}/${hourlyLimit}`);
    }

    return true;
  }

  async sendEmail(to, subject, htmlContent, options = {}) {
    try {
      // Check rate limits before sending
      await this.checkRateLimits();

      const message = {
        to: Array.isArray(to) ? to : [to],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        subject,
        html: htmlContent,
        ...options
      };

      // Add tracking if enabled
      if (options.enableTracking !== false) {
        message.trackingSettings = {
          clickTracking: { enable: true },
          openTracking: { enable: true },
          subscriptionTracking: { enable: false }
        };
      }

      console.log(`📧 Sending email via SendGrid to: ${Array.isArray(to) ? to.length : 1} recipient(s)`);
      
      const result = await this.client.sendMultiple(message);

      // Update rate limiter
      const recipientCount = Array.isArray(to) ? to.length : 1;
      this.rateLimiter.sentToday += recipientCount;
      this.rateLimiter.sentThisHour += recipientCount;

      console.log(`✅ SendGrid email sent successfully. Message ID: ${result[0]?.headers?.['x-message-id']}`);
      
      return {
        success: true,
        messageId: result[0]?.headers?.['x-message-id'],
        provider: 'sendgrid',
        recipients: recipientCount
      };

    } catch (error) {
      console.error('❌ SendGrid email failed:', error.message);
      
      // Handle specific SendGrid errors
      if (error.response) {
        const statusCode = error.response.statusCode;
        const responseBody = error.response.body;
        
        console.error('SendGrid API Error:', {
          statusCode,
          errors: responseBody?.errors,
          message: responseBody?.message
        });

        // Rate limit exceeded
        if (statusCode === 429) {
          throw new Error(`SendGrid rate limit exceeded: ${responseBody?.errors?.[0]?.message || 'Too many requests'}`);
        }

        // Invalid API key
        if (statusCode === 401) {
          throw new Error('SendGrid API key is invalid or expired');
        }

        // Invalid recipient
        if (statusCode === 400) {
          throw new Error(`Invalid email address or request format: ${responseBody?.errors?.[0]?.message || 'Bad request'}`);
        }
      }

      throw error;
    }
  }

  async sendBulkEmails(emails, subject, htmlContent, options = {}) {
    try {
      console.log(`📧 Preparing bulk SendGrid email for ${emails.length} recipients`);

      // Check rate limits for bulk send
      await this.checkRateLimits();

      // Split into batches to avoid hitting limits
      const batchSize = 1000; // SendGrid recommended batch size
      const batches = [];
      
      for (let i = 0; i < emails.length; i += batchSize) {
        batches.push(emails.slice(i, i + batchSize));
      }

      const results = [];
      let totalSent = 0;
      let totalFailed = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📧 Processing batch ${i + 1}/${batches.length} (${batch.length} emails)`);

        try {
          const result = await this.sendEmail(batch, subject, htmlContent, {
            ...options,
            batchId: `batch_${i + 1}_${Date.now()}`
          });

          totalSent += batch.length;
          results.push({
            batch: i + 1,
            success: true,
            sent: batch.length,
            messageId: result.messageId
          });

          // Add delay between batches to respect rate limits
          if (i < batches.length - 1) {
            console.log('⏳ Waiting between batches...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } catch (error) {
          totalFailed += batch.length;
          results.push({
            batch: i + 1,
            success: false,
            failed: batch.length,
            error: error.message
          });
          
          console.error(`❌ Batch ${i + 1} failed:`, error.message);
        }
      }

      console.log(`📊 Bulk SendGrid email completed: ${totalSent} sent, ${totalFailed} failed`);

      return {
        success: totalSent > 0,
        totalSent,
        totalFailed,
        totalEmails: emails.length,
        batches: results,
        provider: 'sendgrid'
      };

    } catch (error) {
      console.error('❌ Bulk SendGrid email failed:', error.message);
      throw error;
    }
  }

  getRateLimitStatus() {
    const { dailyLimit, hourlyLimit } = this.config;
    
    return {
      provider: 'sendgrid',
      daily: {
        used: this.rateLimiter.sentToday,
        limit: dailyLimit,
        remaining: Math.max(0, dailyLimit - this.rateLimiter.sentToday),
        percentage: Math.round((this.rateLimiter.sentToday / dailyLimit) * 100)
      },
      hourly: {
        used: this.rateLimiter.sentThisHour,
        limit: hourlyLimit,
        remaining: Math.max(0, hourlyLimit - this.rateLimiter.sentThisHour),
        percentage: Math.round((this.rateLimiter.sentThisHour / hourlyLimit) * 100)
      }
    };
  }

  async testConnection() {
    try {
      const testEmail = {
        to: 'test@example.com',
        subject: 'SendGrid Connection Test',
        htmlContent: '<p>This is a test email to verify SendGrid connection.</p>'
      };

      // Note: This will fail for invalid test email, but we're just testing API connectivity
      await this.sendEmail(testEmail.to, testEmail.subject, testEmail.htmlContent, {
        enableTracking: false
      });

      return { success: true, message: 'SendGrid connection test successful' };
    } catch (error) {
      // We expect this to fail with invalid email, but if it's an auth error, we know connection failed
      if (error.message.includes('API key is invalid') || error.message.includes('Unauthorized')) {
        return { success: false, error: error.message };
      }
      
      // Other errors mean API key is valid
      return { success: true, message: 'SendGrid API key is valid' };
    }
  }
}

export default SendGridProvider;
