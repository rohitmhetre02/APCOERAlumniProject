import { Notification } from '../models/Notification.js';
import { emitNotificationToCoordinator, emitNotificationToAdmins, emitNotification } from '../config/socket.js';
import { validationResult } from 'express-validator';

// @desc    Get all notifications
// @route   GET /api/admin/notifications
// @access  Admin
export const getAllNotifications = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const notifications = await Notification.getAll(
      parseInt(limit), 
      parseInt(offset)
    );
    
    const unreadCount = await Notification.getUnreadCount();
    
    res.status(200).json({
      status: 'success',
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        unreadCount,
        total: notifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Admin
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid notification ID'
      });
    }
    
    const notification = await Notification.markAsRead(id);
    
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/admin/notifications/read-all
// @access  Admin
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead();
    
    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/admin/notifications/:id
// @access  Admin
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid notification ID'
      });
    }
    
    const notification = await Notification.delete(id);
    
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Create notification (internal use)
// @access  Internal
export const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    // Emit socket event for real-time updates
    const notificationPayload = {
      id: notification.id,
      message: notification.message,
      type: notification.type,
      is_read: notification.is_read,
      created_at: notification.created_at
    };
    
    // If user_id is null, send to admins, otherwise use legacy emit
    if (notificationData.user_id === null) {
      emitNotificationToAdmins(notificationPayload);
      console.log(`📢 Admin notification created and emitted: ${notification.message}`);
    } else {
      emitNotification(notificationPayload);
      console.log(`📢 Notification created and emitted: ${notification.message}`);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// @desc    Get unread notifications count
// @route   GET /api/admin/notifications/unread-count
// @access  Admin
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount();
    
    res.status(200).json({
      status: 'success',
      message: 'Unread count retrieved successfully',
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Create department-specific notification for coordinators
// @access  Internal
export const createDepartmentNotification = async (notificationData) => {
  try {
    const { department, message, type, user_email } = notificationData;
    
    console.log(`🔍 Creating department notification for:`, {
      department,
      message,
      type,
      user_email
    });
    
    // Find all coordinators for this department
    const { pool } = await import('../config/database.js');
    const coordinatorsQuery = `
      SELECT id, email, department as coordinator_department
      FROM users 
      WHERE role = 'coordinator' AND department = $1 AND is_approved = true
    `;
    
    console.log(`🔍 Executing coordinator query for department: ${department}`);
    const coordinatorsResult = await pool.query(coordinatorsQuery, [department]);
    const coordinators = coordinatorsResult.rows;
    
    console.log(`👥 Found ${coordinators.length} coordinators for ${department}:`, 
      coordinators.map(c => ({ id: c.id, email: c.email, department: c.coordinator_department })));
    
    if (coordinators.length === 0) {
      console.log(`⚠️ No active coordinators found for department: ${department}`);
      return null;
    }
    
    // Check if notification already exists for this registration to prevent duplicates
    const existingNotificationQuery = `
      SELECT id FROM notifications 
      WHERE type = $1 AND message LIKE $2 AND created_at > NOW() - INTERVAL '1 hour'
    `;
    
    const existingResult = await pool.query(existingNotificationQuery, [
      type, 
      `%${user_email}%`
    ]);
    
    if (existingResult.rows.length > 0) {
      console.log(`⚠️ Notification already exists for ${user_email}, skipping duplicate`);
      return null;
    }
    
    // Create notification for each coordinator in the department
    const notifications = [];
    for (const coordinator of coordinators) {
      console.log(`📝 Creating notification for coordinator:`, {
        coordinator_id: coordinator.id,
        coordinator_email: coordinator.email,
        coordinator_department: coordinator.coordinator_department
      });
      
      const notification = await Notification.create({
        user_id: coordinator.id,
        message,
        type,
        department // Store department for reference
      });
      
      console.log(`✅ Notification created in database:`, {
        notification_id: notification.id,
        user_id: notification.user_id,
        message: notification.message
      });
      
      // Emit socket event for real-time updates to specific coordinator
      console.log(`📡 Emitting notification to coordinator room: coordinator_${coordinator.id}`);
      emitNotificationToCoordinator(coordinator.id, {
        id: notification.id,
        message: notification.message,
        type: notification.type,
        is_read: notification.is_read,
        created_at: notification.created_at
      });
      
      notifications.push(notification);
    }
    
    console.log(`📢 Department notifications created for ${department}: ${coordinators.length} coordinators notified`);
    return notifications;
  } catch (error) {
    console.error('Error creating department notification:', error);
    throw error;
  }
};

// @desc    Clean up old read notifications (older than 3 days)
// @access  Internal
export const cleanupOldNotifications = async () => {
  try {
    const { pool } = await import('../config/database.js');
    
    const deleteQuery = `
      DELETE FROM notifications 
      WHERE is_read = true AND updated_at < NOW() - INTERVAL '3 days'
    `;
    
    const result = await pool.query(deleteQuery);
    
    if (result.rowCount > 0) {
      console.log(`🧹 Cleaned up ${result.rowCount} old read notifications (older than 3 days)`);
    }
    
    return result.rowCount;
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    throw error;
  }
};

// Run cleanup daily (call this from server startup)
export const scheduleNotificationCleanup = () => {
  // Run cleanup every 24 hours
  setInterval(async () => {
    try {
      await cleanupOldNotifications();
    } catch (error) {
      console.error('Scheduled notification cleanup failed:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  
  // Run once on startup
  cleanupOldNotifications().catch(error => {
    console.error('Startup notification cleanup failed:', error);
  });
};

export default {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  getUnreadCount
};
