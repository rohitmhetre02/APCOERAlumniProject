import nodemailer from 'nodemailer';
import { getRegistrationPendingTemplate, getApprovalTemplate } from '../utils/emailTemplates.js';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log('📧 sendEmail called with:', { to, subject, hasHtml: !!htmlContent });
    console.log('📧 Email config:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM
    });
    
    const transporter = createTransporter();
    console.log('📧 Transporter created successfully');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: htmlContent,
    };
    
    console.log('📧 Mail options prepared:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      htmlLength: mailOptions.html.length
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('📧 Email response:', info);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('❌ Full email error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Send registration pending email
export const sendRegistrationPendingEmail = async (userEmail, userName) => {
  try {
    const { subject, html } = getRegistrationPendingTemplate(userName);
    return await sendEmail(userEmail, subject, html);
  } catch (error) {
    console.error('❌ Error sending registration pending email:', error.message);
    throw error;
  }
};

// Send approval email
export const sendApprovalEmail = async (userEmail, userName) => {
  try {
    const { subject, html } = getApprovalTemplate(userName);
    return await sendEmail(userEmail, subject, html);
  } catch (error) {
    console.error('❌ Error sending approval email:', error.message);
    throw error;
  }
};

// Send bulk email to multiple recipients
export const sendBulkEmail = async (emails, subject, htmlContent) => {
  try {
    console.log(`📧 sendBulkEmail called with:`, { 
      emailCount: emails.length, 
      subject, 
      hasHtml: !!htmlContent 
    });
    
    const transporter = createTransporter();
    console.log('📧 Transporter created successfully for bulk email');
    
    const results = [];
    
    // Send emails with delay to avoid spam filters
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: subject,
          html: htmlContent,
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Bulk email sent successfully to ${email} (${i + 1}/${emails.length})`);
        results.push({ email, success: true, messageId: info.messageId });
        
        // 2-second delay between emails to avoid spam filters
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (emailError) {
        console.error(`❌ Failed to send bulk email to ${email}:`, emailError.message);
        results.push({ email, success: false, error: emailError.message });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`📧 Bulk email completed: ${successCount}/${emails.length} emails sent successfully`);
    
    return { 
      success: successCount > 0, 
      totalSent: successCount, 
      totalFailed: emails.length - successCount,
      results 
    };
    
  } catch (error) {
    console.error('❌ Error sending bulk email:', error.message);
    throw new Error('Failed to send bulk email: ' + error.message);
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    return false;
  }
};

export default {
  sendEmail,
  sendBulkEmail,
  sendRegistrationPendingEmail,
  sendApprovalEmail,
  testEmailConfig
};
