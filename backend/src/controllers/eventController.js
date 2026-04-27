import Event from '../models/Event.js';
import EventRegistration from '../models/EventRegistration.js';
import { validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import { createContentApprovalNotification, createCoordinatorPostNotification } from './notificationController.js';

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    console.log(`🔧 getEventById: Looking for event ${id}, user ${userId}`);
    
    const event = await Event.findById(id);
    
    if (!event) {
      console.log(`🔧 getEventById: Event not found`);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    console.log(`🔧 getEventById: Event found, status: ${event.status}, created_by: ${event.created_by}, user_id: ${userId}`);

    // Only return approved events for public access, but allow owners to see their own events
    if (event.status !== 'approved' && event.created_by !== userId) {
      console.log(`🔧 getEventById: Event not approved and user is not owner`);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event,
      message: 'Event retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching event:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Admin, Coordinator
export const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title, description, event_date, event_time, location,
      event_mode, capacity, event_type, custom_event_type,
      image_url, guest_speakers = []
    } = req.body;

    const eventData = {
      title,
      description,
      event_date,
      event_time,
      location,
      event_mode,
      capacity: parseInt(capacity),
      event_type,
      custom_event_type: event_type === 'other' ? custom_event_type : null,
      image_url,
      created_by: req.user.id,
      created_by_role: req.user.role,
      guest_speakers
    };

    const event = await Event.create(eventData);

    // CASE 2 & 4: Send notification to admin for approval
    if (req.user.role === 'alumni' || req.user.role === 'coordinator') {
      try {
        const contentData = {
          id: event.id,
          title: event.title,
          created_by: req.user.id,
          department: req.user.department
        };

        if (req.user.role === 'alumni') {
          // CASE 2: Alumni creates event -> Notify admin
          await createContentApprovalNotification(contentData, 'event');
          console.log(`📢 CASE 2: Event approval notification sent to admins for: ${event.title}`);
        } else if (req.user.role === 'coordinator') {
          // CASE 4: Coordinator creates event -> Notify admin
          await createCoordinatorPostNotification(contentData, req.user.id);
          console.log(`📢 CASE 4: Coordinator event approval notification sent to admins for: ${event.title}`);
        }
      } catch (notificationError) {
        console.error('❌ Failed to send event approval notification:', notificationError.message);
      }
    }

    // If admin created event, send email to all alumni and coordinators
    if (req.user.role === 'admin') {
      try {
        const { sendAdminEventNotificationEmails } = await import('./emailController.js');
        await sendAdminEventNotificationEmails(event);
        console.log(`📧 Event notification emails sent to alumni and coordinators for: ${event.title}`);
      } catch (emailError) {
        console.error('❌ Failed to send event notification emails:', emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: req.user.role === 'coordinator' 
        ? 'Event submitted successfully! It is now pending admin approval.'
        : 'Event created and approved successfully! Notification emails have been sent to all alumni and coordinators.',
      data: event
    });
  } catch (error) {
    console.error('❌ Error creating event:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// @desc    Get all events (for admin/coordinator)
// @route   GET /api/events
// @access  Admin, Coordinator
export const getAllEvents = async (req, res) => {
  try {
    console.log('📋 Fetching all events for user:', req.user.email, 'Role:', req.user.role);
    
    let events;
    if (req.user.role === 'admin') {
      // Admin can see all events
      events = await Event.getAll();
    } else if (req.user.role === 'coordinator') {
      // Coordinator can see their own events + approved events
      const [ownEvents, approvedEvents] = await Promise.all([
        Event.getByAuthor(req.user.id),
        Event.getAll('approved')
      ]);
      
      // Merge events and remove duplicates
      const allEvents = [...ownEvents, ...approvedEvents];
      const uniqueEvents = allEvents.filter((event, index, self) =>
        index === self.findIndex((e) => e.id === event.id)
      );
      
      events = uniqueEvents;
    }

    console.log(`✅ Found ${events.length} events for ${req.user.role}`);

    res.json({
      success: true,
      message: 'Events retrieved successfully',
      data: events
    });
  } catch (error) {
    console.error('❌ Error fetching events:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// @desc    Get pending events (for admin approval)
// @route   GET /api/events/pending
// @access  Admin only
export const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.getAll('pending');
    
    res.json({
      success: true,
      message: 'Pending events retrieved successfully',
      data: events
    });
  } catch (error) {
    console.error('❌ Error fetching pending events:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending events',
      error: error.message
    });
  }
};

// @desc    Get approved events (public)
// @route   GET /api/events/approved
// @access  Public
export const getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.getAll('approved');
    
    res.json({
      success: true,
      message: 'Approved events retrieved successfully',
      data: events
    });
  } catch (error) {
    console.error('❌ Error fetching approved events:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved events',
      error: error.message
    });
  }
};


// @desc    Update event
// @route   PUT /api/events/:id
// @access  Admin, Coordinator (if creator)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user has permission to update this event
    if (req.user.role !== 'admin' && event.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own events.'
      });
    }

    const updatedEvent = await Event.update(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('❌ Error updating event:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// @desc    Approve event (admin only)
// @route   PUT /api/events/:id/approve
// @access  Admin only
export const approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Event is not pending approval'
      });
    }

    const updatedEvent = await Event.updateStatus(req.params.id, 'approved');

    console.log(`✅ Event updated successfully: ${updatedEvent.title}`);
    console.log(`🔧 Author info: ${updatedEvent.author_name} (${updatedEvent.author_email})`);

    // Send approval email to event creator
    try {
      console.log(`📧 Sending approval email to event creator: ${updatedEvent.author_email}`);
      console.log(`📧 Author email exists: ${!!updatedEvent.author_email}`);
      console.log(`📧 Author name: ${updatedEvent.author_name}`);
      
      const { sendEmail } = await import('../services/emailService.js');
      const { getEventApprovalTemplate } = await import('../utils/emailTemplates.js');
      
      console.log(`📧 Creating event approval email template...`);
      const emailTemplate = getEventApprovalTemplate(updatedEvent);
      console.log(`📧 Email template created. Subject: ${emailTemplate.subject}`);
      console.log(`📧 HTML length: ${emailTemplate.html.length}`);
      
      console.log(`📧 About to send event approval email...`);
      const emailResult = await sendEmail(updatedEvent.author_email, emailTemplate.subject, emailTemplate.html);
      console.log(`✅ Event approval email sent to event creator: ${updatedEvent.author_email}`);
      console.log(`📧 Email result:`, emailResult);
    } catch (emailError) {
      console.error('❌ Failed to send event approval email to creator:', emailError.message);
      console.error('❌ Full email error:', emailError);
    }

    // Send notification to event creator
    try {
      const { createNotification } = await import('./notificationController.js');
      await createNotification({
        user_id: event.created_by,
        message: `Your event "${event.title}" has been approved and is now live!`,
        type: 'event_approved',
        department: event.department
      });
      console.log(`📢 Approval notification sent to event creator for: ${event.title}`);
    } catch (notificationError) {
      console.error('❌ Failed to send approval notification:', notificationError.message);
    }

    // Send notification email to all alumni about new approved event
    try {
      console.log(`📧 Starting bulk email to all alumni about new event...`);
      const { sendBulkEmail } = await import('../services/emailService.js');
      const { getEventNotificationTemplate } = await import('../utils/emailTemplates.js');
      const { pool } = await import('../config/database.js');
      
      // Get all approved alumni emails
      const alumniQuery = `
        SELECT email, first_name, last_name 
        FROM users 
        WHERE role = 'alumni' AND status = 'active'
      `;
      console.log(`📧 Executing alumni query for event notifications...`);
      const alumniResult = await pool.query(alumniQuery);
      
      if (alumniResult.rows.length > 0) {
        console.log(`👥 Found ${alumniResult.rows.length} alumni to notify about event`);
        console.log(`📧 Alumni emails:`, alumniResult.rows.map(a => a.email));
        
        console.log(`📧 Creating event alumni email template...`);
        const emailTemplate = getEventNotificationTemplate({
          recipientName: 'Alumni Member', // Generic since it's bulk
          eventTitle: updatedEvent.title,
          eventDescription: updatedEvent.description ? updatedEvent.description.substring(0, 200) + '...' : '',
          eventDate: updatedEvent.event_date,
          eventTime: updatedEvent.event_time,
          eventMode: updatedEvent.event_mode,
          location: updatedEvent.location,
          guestSpeakers: updatedEvent.guest_speakers ? updatedEvent.guest_speakers.map(s => `${s.name} - ${s.role}`).join(', ') : 'No guest speakers'
        });
        console.log(`📧 Event alumni template subject: ${emailTemplate.subject}`);
        
        const alumniEmails = alumniResult.rows.map(alumni => alumni.email);
        console.log(`📧 About to send bulk event emails to ${alumniEmails.length} alumni...`);
        
        const bulkResult = await sendBulkEmail(alumniEmails, emailTemplate.subject, emailTemplate.html);
        console.log(`✅ Bulk event notification email completed: ${bulkResult.totalSent}/${bulkResult.totalSent + bulkResult.totalFailed} sent successfully`);
        console.log(`📧 Bulk event result details:`, bulkResult);
      } else {
        console.log(`ℹ️ No approved alumni found to notify about event`);
      }
    } catch (bulkEmailError) {
      console.error('❌ Failed to send bulk alumni event notification email:', bulkEmailError.message);
      console.error('❌ Full bulk event email error:', bulkEmailError);
    }

    const responseMessage = `Event "${updatedEvent.title}" approved successfully! Approval email sent to creator and notification sent to all alumni.`;
    console.log(`🎉 Event approval completed successfully!`);
    
    res.json({
      success: true,
      message: responseMessage,
      data: updatedEvent
    });
  } catch (error) {
    console.error('❌ Error approving event:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to approve event',
      error: error.message
    });
  }
};

// @desc    Reject event (admin only)
// @route   PUT /api/events/:id/reject
// @access  Admin only
export const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Event is not pending approval'
      });
    }

    const { rejection_reason } = req.body;
    const updatedEvent = await Event.updateStatus(req.params.id, 'rejected', rejection_reason);

    // Send rejection email to event creator only
    try {
      console.log(`📧 Sending rejection email to event creator: ${updatedEvent.author_email}`);
      const { sendEmail } = await import('../services/emailService.js');
      const { getEventRejectionTemplate } = await import('../utils/emailTemplates.js');
      
      const emailTemplate = getEventRejectionTemplate(updatedEvent, rejection_reason);
      await sendEmail(updatedEvent.author_email, emailTemplate.subject, emailTemplate.html);
      console.log(`✅ Rejection email sent to event creator: ${updatedEvent.author_email}`);
    } catch (emailError) {
      console.error('❌ Failed to send rejection email to creator:', emailError.message);
    }

    // Send notification to event creator
    try {
      const { createNotification } = await import('./notificationController.js');
      await createNotification({
        user_id: event.created_by,
        message: `Your event "${event.title}" has been rejected${rejection_reason ? `. Reason: ${rejection_reason}` : '. Please contact admin for details.'}`,
        type: 'event_rejected',
        department: event.department
      });
      console.log(`📢 Rejection notification sent to event creator for: ${event.title}`);
    } catch (notificationError) {
      console.error('❌ Failed to send rejection notification:', notificationError.message);
    }

    res.json({
      success: true,
      message: 'Event rejected successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('❌ Error rejecting event:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reject event',
      error: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Admin, Coordinator (if creator)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user has permission to delete this event
    if (req.user.role === 'coordinator' && event.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own events.'
      });
    }

    await Event.delete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting event:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};


// Get registrations for a specific event
export const getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`🔧 Controller: Getting registrations for event ${id}, user ${userId}, role ${userRole}`);

    // Check if current user is the creator of this event
    const event = await Event.findById(id);
    console.log(`🔧 Controller: Event found: ${!!event}, created_by: ${event?.created_by}, user_id: ${userId}, user_role: ${userRole}`);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Allow admins and coordinators to view any event's registrations
    // Event creators can also view their own events' registrations
    if (event.created_by !== userId && userRole !== 'admin' && userRole !== 'coordinator') {
      console.log(`🔧 Controller: Access denied - not creator (${event.created_by} !== ${userId}) and not admin/coordinator (${userRole})`);
      return res.status(403).json({
        success: false,
        message: 'You can only view registrations for your own events'
      });
    }

    // Get registrations for this event
    const registrations = await EventRegistration.getByEventId(id);
    console.log(`🔧 Controller: Retrieved ${registrations.length} registrations`);

    res.json({
      success: true,
      data: registrations,
      message: 'Registrations retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching registrations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
};

export const getMyEventRegistrations = async (req, res) => {
  try {
    console.log('🔧 getMyEventRegistrations CONTROLLER CALLED!');
    
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`🔧 getMyEventRegistrations: Getting registrations for event ${id}`);
    console.log(`🔧 getMyEventRegistrations: User ID: ${userId}, Role: ${userRole}`);

    // Check if current user is the creator of this event
    const event = await Event.findById(id);
    console.log(`🔧 getMyEventRegistrations: Event found: ${!!event}`);
    if (event) {
      console.log(`🔧 getMyEventRegistrations: Event created_by: ${event.created_by}, User ID: ${userId}`);
      console.log(`🔧 getMyEventRegistrations: Is creator? ${event.created_by === userId}`);
    }
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only allow event creators (alumni) to view their own events' registrations
    if (event.created_by !== userId) {
      console.log(`🔧 getMyEventRegistrations: Access denied - not creator (${event.created_by} !== ${userId})`);
      return res.status(403).json({
        success: false,
        message: 'You can only view registrations for your own events'
      });
    }

    // Get registrations for this event
    const registrations = await EventRegistration.getByEventId(id);
    console.log(`🔧 getMyEventRegistrations: Retrieved ${registrations.length} registrations`);

    res.json({
      success: true,
      data: registrations,
      message: 'Registrations retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching registrations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
};

// Accept a registration
export const acceptRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get registration with event details to verify ownership
      const registrationQuery = `
        SELECT er.*, e.created_by as event_author_id
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE er.id = $1
      `;
      
      const registrationResult = await client.query(registrationQuery, [registrationId]);
      
      if (registrationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      const registration = registrationResult.rows[0];
      
      // Allow admins and coordinators to manage any event's registrations
      // Event creators can also manage their own events' registrations
      if (registration.event_author_id !== userId && userRole !== 'admin' && userRole !== 'coordinator') {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          message: 'You can only manage registrations for your own events'
        });
      }

      // Update registration status
      const updateQuery = `
        UPDATE event_registrations 
        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      await client.query(updateQuery, [registrationId]);
      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Registration accepted successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error accepting registration:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to accept registration',
      error: error.message
    });
  }
};

// Reject a registration
export const rejectRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { rejection_reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get registration with event details to verify ownership
      const registrationQuery = `
        SELECT er.*, e.created_by as event_author_id
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE er.id = $1
      `;
      
      const registrationResult = await client.query(registrationQuery, [registrationId]);
      
      if (registrationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      const registration = registrationResult.rows[0];
      
      // Allow admins and coordinators to manage any event's registrations
      // Event creators can also manage their own events' registrations
      if (registration.event_author_id !== userId && userRole !== 'admin' && userRole !== 'coordinator') {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          message: 'You can only manage registrations for your own events'
        });
      }

      // Update registration status
      const updateQuery = `
        UPDATE event_registrations 
        SET status = 'rejected', rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      await client.query(updateQuery, [registrationId, rejection_reason || null]);
      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Registration rejected successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error rejecting registration:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reject registration',
      error: error.message
    });
  }
};

// Debug function to check alumni and test email
export const debugAlumniEmail = async (req, res) => {
  try {
    const { pool } = await import('../config/database.js');
    const { sendBulkEmail } = await import('../services/emailService.js');
    
    console.log('🔍 Debug: Checking alumni for email sending...');
    
    // Check all users
    const allUsersQuery = `SELECT role, status, COUNT(*) as count FROM users GROUP BY role, status`;
    const allUsersResult = await pool.query(allUsersQuery);
    console.log('📊 All users by role and status:', allUsersResult.rows);
    
    // Check approved alumni specifically
    const alumniQuery = `
      SELECT email, first_name, last_name, status 
      FROM users 
      WHERE role = 'alumni'
    `;
    const alumniResult = await pool.query(alumniQuery);
    console.log(`👥 Found ${alumniResult.rows.length} total alumni:`, alumniResult.rows);
    
    // Check approved alumni
    const approvedAlumniQuery = `
      SELECT email, first_name, last_name, status 
      FROM users 
      WHERE role = 'alumni' AND status = 'active'
    `;
    const approvedAlumniResult = await pool.query(approvedAlumniQuery);
    console.log(`✅ Found ${approvedAlumniResult.rows.length} active alumni:`, approvedAlumniResult.rows);
    
    // Test bulk email if approved alumni exist
    if (approvedAlumniResult.rows.length > 0) {
      console.log('📧 Testing bulk email to approved alumni...');
      try {
        const testEmails = approvedAlumniResult.rows.map(a => a.email);
        const bulkResult = await sendBulkEmail(
          testEmails,
          '🧪 Test Email: Alumni Email System Working',
          '<h1>Test Email</h1><p>This is a test to verify the alumni email system is working correctly.</p>'
        );
        console.log('✅ Test bulk email result:', bulkResult);
      } catch (emailError) {
        console.error('❌ Test bulk email failed:', emailError.message);
      }
    } else {
      console.log('⚠️ No active alumni found to test email sending');
    }
    
    res.json({
      success: true,
      message: 'Debug completed',
      data: {
        totalUsers: allUsersResult.rows,
        totalAlumni: alumniResult.rows,
        activeAlumni: approvedAlumniResult.rows,
        activeAlumniCount: approvedAlumniResult.rows.length
      }
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
};

// Simple alumni count test
export const testAlumniCount = async (req, res) => {
  try {
    const { pool } = await import('../config/database.js');
    
    // Test query for active alumni
    const alumniQuery = `
      SELECT email, first_name, last_name, status 
      FROM users 
      WHERE role = 'alumni' AND status = 'active'
    `;
    const alumniResult = await pool.query(alumniQuery);
    
    console.log(`🔍 Found ${alumniResult.rows.length} active alumni:`, alumniResult.rows.map(a => `${a.first_name} ${a.last_name} (${a.email})`));
    
    res.json({
      success: true,
      message: `Found ${alumniResult.rows.length} active alumni`,
      alumni: alumniResult.rows
    });
    
  } catch (error) {
    console.error('❌ Error testing alumni count:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to test alumni count',
      error: error.message
    });
  }
};

// Comprehensive debug for admin event email system
export const debugAdminEventEmail = async (req, res) => {
  try {
    const { pool } = await import('../config/database.js');
    const { sendAdminEventNotificationEmails } = await import('./emailController.js');
    const { sendEmail } = await import('../services/emailService.js');
    const { getAdminEventNotificationTemplate } = await import('../utils/emailTemplates.js');
    
    console.log('🔍 Debug: Testing admin event email system...');
    
    // 1. Check all users by role and status
    console.log('1️⃣ Checking all users by role and status...');
    const allUsersQuery = `SELECT role, status, COUNT(*) as count FROM users GROUP BY role, status`;
    const allUsersResult = await pool.query(allUsersQuery);
    console.log('📊 All users by role and status:', allUsersResult.rows);
    
    // 2. Check alumni specifically
    console.log('2️⃣ Checking alumni users...');
    const alumniQuery = `SELECT email, first_name, last_name, status FROM users WHERE role = 'alumni'`;
    const alumniResult = await pool.query(alumniQuery);
    console.log(`👥 Found ${alumniResult.rows.length} total alumni:`, alumniResult.rows);
    
    // 3. Check active alumni
    console.log('3️⃣ Checking active alumni...');
    const activeAlumniQuery = `SELECT email, first_name, last_name, status FROM users WHERE role = 'alumni' AND status = 'active'`;
    const activeAlumniResult = await pool.query(activeAlumniQuery);
    console.log(`✅ Found ${activeAlumniResult.rows.length} active alumni:`, activeAlumniResult.rows);
    
    // 4. Check coordinators specifically
    console.log('4️⃣ Checking coordinator users...');
    const coordinatorQuery = `SELECT email, first_name, last_name, status FROM users WHERE role = 'coordinator'`;
    const coordinatorResult = await pool.query(coordinatorQuery);
    console.log(`👥 Found ${coordinatorResult.rows.length} total coordinators:`, coordinatorResult.rows);
    
    // 5. Check active coordinators
    console.log('5️⃣ Checking active coordinators...');
    const activeCoordinatorQuery = `SELECT email, first_name, last_name, status FROM users WHERE role = 'coordinator' AND status = 'active'`;
    const activeCoordinatorResult = await pool.query(activeCoordinatorQuery);
    console.log(`✅ Found ${activeCoordinatorResult.rows.length} active coordinators:`, activeCoordinatorResult.rows);
    
    // 6. Test the exact query used in email sending
    console.log('6️⃣ Testing exact email query...');
    const emailQuery = `SELECT email, first_name, last_name, role FROM users WHERE (role = 'alumni' OR role = 'coordinator') AND status = 'active'`;
    const emailResult = await pool.query(emailQuery);
    console.log(`📧 Found ${emailResult.rows.length} email recipients:`, emailResult.rows);
    
    // 7. Test email template creation
    console.log('7️⃣ Testing email template creation...');
    const testEvent = {
      title: 'Test Event for Debug',
      description: 'This is a test event to debug the email system',
      event_date: new Date(),
      event_time: '10:00',
      event_mode: 'In-Person',
      location: 'Test Location',
      guest_speakers: []
    };
    
    try {
      const emailTemplate = getAdminEventNotificationTemplate({
        recipientName: 'Test User',
        ...testEvent
      });
      console.log('✅ Email template created successfully');
      console.log(`📧 Template subject: ${emailTemplate.subject}`);
      console.log(`📧 Template HTML length: ${emailTemplate.html.length}`);
    } catch (templateError) {
      console.error('❌ Email template creation failed:', templateError.message);
    }
    
    // 8. Test single email sending
    console.log('8️⃣ Testing single email sending...');
    if (emailResult.rows.length > 0) {
      const testRecipient = emailResult.rows[0];
      try {
        const emailTemplate = getAdminEventNotificationTemplate({
          recipientName: testRecipient.first_name,
          ...testEvent
        });
        
        const singleEmailResult = await sendEmail(
          testRecipient.email, 
          `🧪 Test: ${emailTemplate.subject}`, 
          emailTemplate.html
        );
        console.log('✅ Single email test successful:', singleEmailResult);
      } catch (singleEmailError) {
        console.error('❌ Single email test failed:', singleEmailError.message);
      }
    } else {
      console.log('⚠️ No recipients found for single email test');
    }
    
    // 9. Test bulk email sending (if recipients exist)
    console.log('9️⃣ Testing bulk email sending...');
    if (emailResult.rows.length > 0) {
      try {
        // Create a mock event object for testing
        const mockEvent = {
          id: 'test',
          title: 'Test Event for Debug',
          description: 'This is a test event to debug the email system',
          event_date: new Date().toISOString(),
          event_time: '10:00',
          event_mode: 'In-Person',
          location: 'Test Location',
          guest_speakers: []
        };
        
        console.log('📧 About to test bulk email sending...');
        await sendAdminEventNotificationEmails(mockEvent);
        console.log('✅ Bulk email test completed');
      } catch (bulkEmailError) {
        console.error('❌ Bulk email test failed:', bulkEmailError.message);
      }
    } else {
      console.log('⚠️ No recipients found for bulk email test');
    }
    
    // 10. Test email configuration
    console.log('🔟 Testing email configuration...');
    try {
      const { testEmailConfig } = await import('../services/emailService.js');
      const configValid = await testEmailConfig();
      console.log(configValid ? '✅ Email configuration is valid' : '❌ Email configuration is invalid');
    } catch (configError) {
      console.error('❌ Email configuration test failed:', configError.message);
    }
    
    const debugData = {
      allUsers: allUsersResult.rows,
      totalAlumni: alumniResult.rows,
      activeAlumni: activeAlumniResult.rows,
      totalCoordinators: coordinatorResult.rows,
      activeCoordinators: activeCoordinatorResult.rows,
      emailRecipients: emailResult.rows,
      emailConfigTest: 'Completed (check console logs)',
      systemStatus: emailResult.rows.length > 0 ? '✅ Ready for use' : '⚠️ No active recipients found'
    };
    
    res.json({
      success: true,
      message: 'Admin event email system debug completed',
      data: debugData
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
};

// Get current user's events (for alumni)
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const events = await Event.getByAuthor(userId);

    res.json({
      success: true,
      data: events,
      message: 'Your events retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching your events:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your events',
      error: error.message
    });
  }
};
