import { emitNotification } from '../config/socket.js';

// @desc    CASE 5: REAL-TIME NOTIFICATION SERVICE
// @access  Internal
export const emitRealTimeNotification = async (notification, userId = null) => {
  try {
    // Emit to specific user if userId provided, otherwise emit to all
    if (userId) {
      // Emit to specific user's room
      emitNotification(userId, {
        id: notification.id,
        message: notification.message,
        type: notification.type,
        role_target: notification.role_target,
        department: notification.department,
        reference_id: notification.reference_id,
        is_read: notification.is_read,
        created_at: notification.created_at,
        sender: notification.sender_data || null
      });
      
      console.log(`📡 CASE 5: Real-time notification sent to user ${userId}`);
    } else {
      // Emit to admin room for general notifications
      emitNotification('admin_room', {
        id: notification.id,
        message: notification.message,
        type: notification.type,
        role_target: notification.role_target,
        department: notification.department,
        reference_id: notification.reference_id,
        is_read: notification.is_read,
        created_at: notification.created_at,
        sender: notification.sender_data || null
      });
      
      console.log(`📡 CASE 5: Real-time notification sent to admin room`);
    }
  } catch (error) {
    console.error('Error emitting real-time notification:', error);
    // Don't throw error - notification should still work even if socket fails
  }
};

// @desc    Enhanced notification creation with real-time emit
// @access  Internal
export const createNotificationWithRealTime = async ({
  receiver_id,
  sender_id = null,
  role_target,
  department = null,
  message,
  type,
  reference_id = null,
  emitRealTime = true
}) => {
  try {
    // Import here to avoid circular dependency
    const { createNotification } = await import('../controllers/notificationController.js');
    
    // Create the notification in database
    const notification = await createNotification({
      receiver_id,
      sender_id,
      role_target,
      department,
      message,
      type,
      reference_id
    });
    
    // Emit real-time notification if enabled
    if (emitRealTime) {
      await emitRealTimeNotification(notification, receiver_id);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification with real-time:', error);
    throw error;
  }
};
