import { pool } from '../config/database.js';
import { sendEmail } from '../services/emailService.js';
import { getEventNotificationTemplate, getEventRejectionTemplate } from '../utils/emailTemplates.js';

// @desc    Send event notification emails to all alumni
// @access  Internal
export const sendEventNotificationEmails = async (event) => {
  try {
    console.log(`📧 Sending event notification emails for: ${event.title}`);
    
    // Get all approved alumni
    const alumniQuery = `
      SELECT email, first_name, last_name 
      FROM users 
      WHERE role = 'alumni' AND status = 'active'
    `;
    
    const alumniResult = await pool.query(alumniQuery);
    const alumni = alumniResult.rows;
    
    console.log(`👥 Found ${alumni.length} alumni to send event notifications`);
    
    // Format guest speakers for email
    const guestSpeakersText = event.guest_speakers && event.guest_speakers.length > 0
      ? event.guest_speakers.map(speaker => `${speaker.name} (${speaker.role}) - ${speaker.topic}`).join(', ')
      : 'No guest speakers';
    
    // Send emails with 2-second delay between each
    for (let i = 0; i < alumni.length; i++) {
      const alum = alumni[i];
      
      const emailContent = getEventNotificationTemplate({
        recipientName: alum.first_name,
        eventTitle: event.title,
        eventDescription: event.description ? event.description.substring(0, 200) + '...' : '',
        eventDate: event.event_date,
        eventTime: event.event_time,
        eventMode: event.event_mode,
        location: event.location,
        guestSpeakers: guestSpeakersText
      });
      
      try {
        await sendEmail(alum.email, `🎉 New Event: ${event.title}`, emailContent.html);
        
        console.log(`✅ Event notification sent to: ${alum.email} (${i + 1}/${alumni.length})`);
        
        // 2-second delay between emails
        if (i < alumni.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (emailError) {
        console.error(`❌ Failed to send event notification to ${alum.email}:`, emailError.message);
      }
    }
    
    console.log(`📧 Event notification emails completed for: ${event.title}`);
    
  } catch (error) {
    console.error('❌ Error sending event notification emails:', error.message);
    throw error;
  }
};

// @desc    Send event rejection email to event creator
// @access  Internal
export const sendEventRejectionEmail = async (event, rejectionReason) => {
  try {
    console.log(`📧 Sending event rejection email to: ${event.created_by_email}`);
    
    const emailContent = getEventRejectionTemplate({
      recipientName: event.created_by_name,
      eventTitle: event.title,
      rejectionReason: rejectionReason || 'Event does not meet our requirements'
    });
    
    await sendEmail(event.created_by_email, `Event Rejected: ${event.title}`, emailContent.html);
    
    console.log(`✅ Event rejection email sent to: ${event.created_by_email}`);
    
  } catch (error) {
    console.error('❌ Error sending event rejection email:', error.message);
    throw error;
  }
};

// Send admin event notification emails to all alumni and coordinators
export const sendAdminEventNotificationEmails = async (event) => {
  try {
    console.log(`📧 Starting admin event notification emails for: ${event.title}`);
    console.log(`📧 Event data:`, { title: event.title, description: event.description?.substring(0, 100), event_date: event.event_date });
    
    // Get all active alumni and coordinators
    const notificationQuery = `
      SELECT email, first_name, last_name, role 
      FROM users 
      WHERE (role = 'alumni' OR role = 'coordinator') AND status = 'active'
    `;
    
    console.log(`📧 Executing query: ${notificationQuery}`);
    const notificationResult = await pool.query(notificationQuery);
    const recipients = notificationResult.rows;
    
    const alumniCount = recipients.filter(r => r.role === 'alumni').length;
    const coordinatorCount = recipients.filter(r => r.role === 'coordinator').length;
    
    console.log(`👥 Found ${recipients.length} recipients (${alumniCount} alumni, ${coordinatorCount} coordinators) to send event notifications`);
    console.log(`📧 Recipients list:`, recipients.map(r => `${r.first_name} ${r.last_name} (${r.email}) - ${r.role}`));
    
    if (recipients.length === 0) {
      console.log('ℹ️ No active alumni or coordinators found to notify');
      return;
    }
    
    console.log(`📧 Starting to send ${recipients.length} emails with 2-second delays...`);
    
    // Send emails with 2-second delay between each
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      console.log(`📧 Processing recipient ${i + 1}/${recipients.length}: ${recipient.email} (${recipient.role})`);
      
      try {
        console.log(`📧 Creating email template for ${recipient.first_name}...`);
        const { getAdminEventNotificationTemplate } = await import('../utils/emailTemplates.js');
        
        const emailContent = getAdminEventNotificationTemplate({
          recipientName: recipient.first_name,
          eventTitle: event.title,
          eventDescription: event.description,
          eventDate: event.event_date,
          eventTime: event.event_time,
          eventMode: event.event_mode,
          location: event.location,
          guestSpeakers: event.guest_speakers || []
        });
        
        console.log(`📧 Email template created. Subject: 🎉 New Event: ${event.title}`);
        console.log(`📧 Template type: ${typeof emailContent}`);
        console.log(`📧 Template has html property: ${!!emailContent.html}`);
        console.log(`📧 HTML length: ${emailContent.html ? emailContent.html.length : 'undefined'}`);
        console.log(`📧 About to send email to ${recipient.email}...`);
        
        await sendEmail(recipient.email, `🎉 New Event: ${event.title}`, emailContent.html);
        
        console.log(`✅ Event notification sent successfully to: ${recipient.email} (${recipient.role}) (${i + 1}/${recipients.length})`);
        
        // 2-second delay between emails
        if (i < recipients.length - 1) {
          console.log(`⏳ Waiting 2 seconds before next email...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log(`⏰ Resuming email sending...`);
        }
        
      } catch (emailError) {
        console.error(`❌ Failed to send event notification to ${recipient.email}:`, emailError.message);
        console.error(`❌ Full error details:`, emailError);
      }
    }
    
    console.log(`📧 Admin event notification emails completed successfully for: ${event.title}`);
    
  } catch (error) {
    console.error('❌ Error sending admin event notification emails:', error.message);
    console.error('❌ Full error details:', error);
    throw error;
  }
};

// Send admin opportunity notification emails to all alumni
export const sendAdminOpportunityNotificationEmails = async (opportunity) => {
  try {
    console.log(`📧 Starting admin opportunity notification emails for: ${opportunity.title}`);
    console.log(`📧 Opportunity data:`, { 
      title: opportunity.title, 
      company: opportunity.company, 
      type: opportunity.type,
      location: opportunity.location,
      deadline: opportunity.deadline 
    });
    
    // Get all active alumni only (not coordinators for opportunities)
    const notificationQuery = `
      SELECT email, first_name, last_name, role 
      FROM users 
      WHERE role = 'alumni' AND status = 'active'
    `;
    
    console.log(`📧 Executing query: ${notificationQuery}`);
    const notificationResult = await pool.query(notificationQuery);
    const recipients = notificationResult.rows;
    
    console.log(`👥 Found ${recipients.length} alumni recipients to send opportunity notifications`);
    console.log(`📧 Recipients list:`, recipients.map(r => `${r.first_name} ${r.last_name} (${r.email}) - ${r.role}`));
    
    if (recipients.length === 0) {
      console.log('ℹ️ No active alumni found to notify about opportunity');
      return;
    }
    
    console.log(`📧 Starting to send ${recipients.length} opportunity emails with 2-second delays...`);
    
    // Send emails with 2-second delay between each
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      console.log(`📧 Processing recipient ${i + 1}/${recipients.length}: ${recipient.email} (${recipient.role})`);
      
      try {
        console.log(`📧 Creating opportunity email template for ${recipient.first_name}...`);
        const { getAdminOpportunityNotificationTemplate } = await import('../utils/emailTemplates.js');
        
        const emailContent = getAdminOpportunityNotificationTemplate({
          recipientName: recipient.first_name,
          title: opportunity.title,
          company: opportunity.company,
          type: opportunity.type,
          location: opportunity.location,
          salary_range: opportunity.salary_range,
          experience_range: opportunity.experience_range,
          deadline: opportunity.deadline,
          description: opportunity.description,
          skills: opportunity.skills || []
        });
        
        console.log(`📧 Email template created. Subject: 💼 New Opportunity: ${opportunity.title}`);
        console.log(`📧 Template type: ${typeof emailContent}`);
        console.log(`📧 Template has html property: ${!!emailContent.html}`);
        console.log(`📧 HTML length: ${emailContent.html ? emailContent.html.length : 'undefined'}`);
        console.log(`📧 About to send opportunity email to ${recipient.email}...`);
        
        await sendEmail(recipient.email, `💼 New Opportunity: ${opportunity.title}`, emailContent.html);
        
        console.log(`✅ Opportunity notification sent successfully to: ${recipient.email} (${recipient.role}) (${i + 1}/${recipients.length})`);
        
        // 2-second delay between emails
        if (i < recipients.length - 1) {
          console.log(`⏳ Waiting 2 seconds before next opportunity email...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log(`⏰ Resuming opportunity email sending...`);
        }
        
      } catch (emailError) {
        console.error(`❌ Failed to send opportunity notification to ${recipient.email}:`, emailError.message);
        console.error(`❌ Full opportunity email error:`, emailError);
      }
    }
    
    console.log(`📧 Admin opportunity notification emails completed successfully for: ${opportunity.title}`);
    
  } catch (error) {
    console.error('❌ Error sending admin opportunity notification emails:', error.message);
    console.error('❌ Full opportunity email error details:', error);
    throw error;
  }
};
