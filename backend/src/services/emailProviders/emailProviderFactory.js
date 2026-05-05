// Email Provider Factory - Production Ready
import SendGridProvider from './sendGridProvider.js';
import { TestProvider } from './testProvider.js';

class EmailProviderFactory {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
  }

  async initializeProvider(providerName, config) {
    try {
      console.log(`🔧 Initializing email provider: ${providerName}`);
      
      let provider;
      
      switch (providerName.toLowerCase()) {
        case 'sendgrid':
          provider = new SendGridProvider(config.sendgrid);
          break;
        
        case 'test':
          provider = new TestProvider();
          break;
        
        case 'ses':
          // AWS SES provider would be implemented here
          throw new Error('AWS SES provider not implemented yet');
        
        case 'mailgun':
          // Mailgun provider would be implemented here
          throw new Error('Mailgun provider not implemented yet');
        
        default:
          throw new Error(`Unsupported email provider: ${providerName}`);
      }

      await provider.initialize();
      this.providers.set(providerName, provider);
      this.currentProvider = provider;
      
      console.log(`✅ Email provider ${providerName} initialized successfully`);
      return provider;
      
    } catch (error) {
      console.error(`❌ Failed to initialize email provider ${providerName}:`, error.message);
      throw error;
    }
  }

  getCurrentProvider() {
    if (!this.currentProvider) {
      throw new Error('No email provider initialized. Call initializeProvider first.');
    }
    return this.currentProvider;
  }

  getProvider(providerName) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Email provider ${providerName} not found`);
    }
    return provider;
  }

  async sendEmail(to, subject, htmlContent, options = {}) {
    try {
      const provider = this.getCurrentProvider();
      return await provider.sendEmail(to, subject, htmlContent, options);
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      throw error;
    }
  }

  async sendBulkEmails(emails, subject, htmlContent, options = {}) {
    try {
      const provider = this.getCurrentProvider();
      return await provider.sendBulkEmails(emails, subject, htmlContent, options);
    } catch (error) {
      console.error('❌ Bulk email sending failed:', error.message);
      throw error;
    }
  }

  getRateLimitStatus() {
    try {
      const provider = this.getCurrentProvider();
      return provider.getRateLimitStatus();
    } catch (error) {
      console.error('❌ Failed to get rate limit status:', error.message);
      return {
        provider: 'unknown',
        error: error.message
      };
    }
  }

  async testConnection() {
    try {
      const provider = this.getCurrentProvider();
      return await provider.testConnection();
    } catch (error) {
      console.error('❌ Email provider connection test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async switchProvider(providerName, config) {
    try {
      console.log(`🔄 Switching email provider to: ${providerName}`);
      
      // Initialize new provider
      await this.initializeProvider(providerName, config);
      
      console.log(`✅ Successfully switched to email provider: ${providerName}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to switch email provider:`, error.message);
      throw error;
    }
  }

  listProviders() {
    return Array.from(this.providers.keys());
  }

  getProviderStats() {
    const stats = {};
    
    for (const [name, provider] of this.providers) {
      try {
        stats[name] = {
          name,
          isActive: provider === this.currentProvider,
          rateLimit: provider.getRateLimitStatus()
        };
      } catch (error) {
        stats[name] = {
          name,
          isActive: provider === this.currentProvider,
          error: error.message
        };
      }
    }
    
    return stats;
  }
}

// Singleton instance
const emailProviderFactory = new EmailProviderFactory();

export default emailProviderFactory;
