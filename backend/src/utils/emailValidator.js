// Email Validation Utility - Production Ready

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid email templates
const validTemplates = [
  'registration-pending',
  'account-approved',
  'account-rejected',
  'account-created',
  'coordinator-account-created',
  'otp',
  'content-approved',
  'content-notification',
  'news-notification'
];

// Validate email address
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return emailRegex.test(email.trim());
};

// Validate email template type
export const isValidTemplate = (template) => {
  if (!template || typeof template !== 'string') {
    return false;
  }
  return validTemplates.includes(template);
};

// Validate email request body
export const validateEmailRequest = (req, res, next) => {
  const { to, subject, htmlContent, template, data } = req.body;

  // For template-based emails
  if (template) {
    if (!isValidTemplate(template)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template type',
        availableTemplates: validTemplates
      });
    }

    if (!to || !isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: 'Valid recipient email is required'
      });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Template data object is required'
      });
    }

    // Template-specific validation
    if (template === 'otp' && (!data.otp || !data.userName)) {
      return res.status(400).json({
        success: false,
        message: 'OTP template requires otp and userName in data'
      });
    }

    if (template === 'registration-pending' && !data.userName) {
      return res.status(400).json({
        success: false,
        message: 'Registration template requires userName in data'
      });
    }

  } else {
    // For custom emails
    if (!to || !isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: 'Valid recipient email is required'
      });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required and must be a non-empty string'
      });
    }

    if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'HTML content is required and must be a non-empty string'
      });
    }
  }

  // Validate recipients array for bulk emails
  if (req.body.recipients) {
    const { recipients } = req.body;
    
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients must be a non-empty array'
      });
    }

    const invalidEmails = recipients.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email addresses found in recipients',
        invalidEmails
      });
    }

    if (recipients.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 1000 recipients allowed per bulk email'
      });
    }
  }

  next();
};

// Sanitize email content
export const sanitizeEmailContent = (content) => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Basic XSS prevention
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Validate email options
export const validateEmailOptions = (options = {}) => {
  const validOptions = {
    priority: [1, 2, 3, 4, 5],
    delay: 'number',
    category: 'string'
  };

  const validatedOptions = {};

  Object.keys(options).forEach(key => {
    if (validOptions[key]) {
      if (validOptions[key] === 'number' && typeof options[key] === 'number') {
        validatedOptions[key] = options[key];
      } else if (Array.isArray(validOptions[key]) && validOptions[key].includes(options[key])) {
        validatedOptions[key] = options[key];
      } else if (typeof options[key] === validOptions[key]) {
        validatedOptions[key] = options[key];
      }
    }
  });

  return validatedOptions;
};

// Get available templates
export const getAvailableTemplates = () => {
  return [...validTemplates];
};

export default {
  isValidEmail,
  isValidTemplate,
  validateEmailRequest,
  sanitizeEmailContent,
  validateEmailOptions,
  getAvailableTemplates
};
