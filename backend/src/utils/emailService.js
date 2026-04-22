import { getApplicationAcceptedTemplate, getApplicationReviewedTemplate, getApplicationRejectedTemplate } from './emailTemplates.js';

// Send application accepted email
export const sendApplicationAcceptedEmail = async ({ userName, userEmail, opportunityTitle, company, opportunityDescription }) => {
  try {
    console.log('🔧 Sending application accepted email...');
    console.log('🔧 Email configuration check:', {
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET'
    });

    const { subject, html } = getApplicationAcceptedTemplate(userName, opportunityTitle, company, opportunityDescription);
    
    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer');
    
    // Check if email configuration is properly set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Skipping email send.');
      console.log('📧 Email content that would be sent:', { subject, to: userEmail });
      return { skipped: true, reason: 'Email credentials not configured' };
    }
    
    // Create transporter (configure with your email service)
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('🔧 Email transporter verified successfully');

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"APCOER Alumni Portal" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: html
    });

    console.log('✅ Application accepted email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending application accepted email:', error.message);
    console.log('📧 Email content that failed to send:', { subject, to: userEmail });
    // Don't throw error, just log it so the main process doesn't fail
    return { error: error.message, skipped: true };
  }
};

// Send application reviewed email
export const sendApplicationReviewedEmail = async ({ userName, userEmail, opportunityTitle, company }) => {
  try {
    console.log('🔧 Sending application reviewed email...');
    
    const { subject, html } = getApplicationReviewedTemplate(userName, opportunityTitle, company);
    
    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer');
    
    // Check if email configuration is properly set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Skipping email send.');
      console.log('📧 Email content that would be sent:', { subject, to: userEmail });
      return { skipped: true, reason: 'Email credentials not configured' };
    }
    
    // Create transporter (configure with your email service)
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('🔧 Email transporter verified successfully');

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"APCOER Alumni Portal" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: html
    });

    console.log('✅ Application reviewed email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending application reviewed email:', error.message);
    console.log('📧 Email content that failed to send:', { subject, to: userEmail });
    // Don't throw error, just log it so the main process doesn't fail
    return { error: error.message, skipped: true };
  }
};

// Send application rejected email
export const sendApplicationRejectedEmail = async ({ userName, userEmail, opportunityTitle, company }) => {
  try {
    console.log('🔧 Sending application rejected email...');
    
    const { subject, html } = getApplicationRejectedTemplate(userName, opportunityTitle, company);
    
    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer');
    
    // Check if email configuration is properly set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Skipping email send.');
      console.log('📧 Email content that would be sent:', { subject, to: userEmail });
      return { skipped: true, reason: 'Email credentials not configured' };
    }
    
    // Create transporter (configure with your email service)
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('🔧 Email transporter verified successfully');

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"APCOER Alumni Portal" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: html
    });

    console.log('✅ Application rejected email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending application rejected email:', error.message);
    console.log('📧 Email content that failed to send:', { subject, to: userEmail });
    // Don't throw error, just log it so the main process doesn't fail
    return { error: error.message, skipped: true };
  }
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
