import { pool } from '../config/database.js';

// @desc    Helper function to create notifications
// @access  Internal
export const createNotification = async ({
  receiver_id,
  sender_id = null,
  role_target,
  department = null,
  message,
  type,
  reference_id = null
}) => {
  try {
    const query = `
      INSERT INTO notifications (
        receiver_id, 
        sender_id, 
        role_target, 
        department, 
        message, 
        type, 
        reference_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      receiver_id,
      sender_id,
      role_target,
      department,
      message,
      type,
      reference_id
    ]);
    
    const notification = result.rows[0];
    console.log(`📢 Notification created: ${message} (ID: ${notification.id})`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// @desc    Get notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const query = `
      SELECT 
        n.id,
        n.sender_id,
        n.receiver_id,
        n.role_target,
        n.department,
        n.message,
        n.type,
        n.reference_id,
        n.is_read,
        n.created_at,
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name,
        sender.email as sender_email,
        sender.role as sender_role
      FROM notifications n
      LEFT JOIN users sender ON n.sender_id = sender.id
      WHERE n.receiver_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, parseInt(limit), parseInt(offset)]);
    
    // Get unread count
    const unreadQuery = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE receiver_id = $1 AND is_read = false
    `;
    const unreadResult = await pool.query(unreadQuery, [userId]);
    const unreadCount = parseInt(unreadResult.rows[0].count);
    
    res.status(200).json({
      status: 'success',
      message: 'Notifications retrieved successfully',
      data: {
        notifications: result.rows,
        unreadCount,
        total: result.rows.length
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
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid notification ID'
      });
    }
    
    const query = `
      UPDATE notifications 
      SET is_read = true
      WHERE id = $1 AND receiver_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found or access denied'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Mark all notifications as read for user
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      UPDATE notifications 
      SET is_read = true
      WHERE receiver_id = $1 AND is_read = false
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.status(200).json({
      status: 'success',
      message: `Marked ${result.rows.length} notifications as read`,
      data: {
        markedCount: result.rows.length,
        notifications: result.rows
      }
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
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid notification ID'
      });
    }
    
    const query = `
      DELETE FROM notifications 
      WHERE id = $1 AND receiver_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found or access denied'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};


// @desc    CASE 1: USER REGISTRATION - Notify same department coordinators
// @access  Internal
export const createAlumniRegistrationNotification = async (alumniData) => {
  try {
    // Find coordinators for the same department
    const coordinatorsQuery = `
      SELECT id, email, department
      FROM users 
      WHERE role = 'coordinator' AND department = $1 AND is_approved = true
    `;
    
    const coordinatorsResult = await pool.query(coordinatorsQuery, [alumniData.department]);
    const coordinators = coordinatorsResult.rows;
    
    if (coordinators.length === 0) {
      console.log(`⚠️ No coordinators found for department: ${alumniData.department}`);
      return [];
    }
    
    const notifications = [];
    for (const coordinator of coordinators) {
      const notification = await createNotification({
        receiver_id: coordinator.id,
        sender_id: alumniData.id,
        role_target: 'coordinator',
        department: alumniData.department,
        message: "New student registered in your department. Approval required.",
        type: 'registration',
        reference_id: alumniData.id
      });
      notifications.push(notification);
    }
    
    console.log(`📢 CASE 1: Created ${notifications.length} registration notifications for ${alumniData.department} coordinators`);
    return notifications;
  } catch (error) {
    console.error('Error creating alumni registration notification:', error);
    throw error;
  }
};

// @desc    CASE 2: ALUMNI CREATES POST - Notify admin only
// @access  Internal
export const createContentApprovalNotification = async (contentData, contentType) => {
  try {
    // Find all admins
    const adminsQuery = `
      SELECT id, email
      FROM users 
      WHERE role = 'admin' AND is_approved = true
    `;
    
    const adminsResult = await pool.query(adminsQuery);
    const admins = adminsResult.rows;
    
    if (admins.length === 0) {
      console.log(`⚠️ No admins found for content approval notification`);
      return [];
    }
    
    const notifications = [];
    for (const admin of admins) {
      const notification = await createNotification({
        receiver_id: admin.id,
        sender_id: contentData.created_by || null,
        role_target: 'admin',
        department: null, // Admin notifications don't need department
        message: "New post created by alumni. Approval required.",
        type: 'approval',
        reference_id: contentData.id
      });
      notifications.push(notification);
    }
    
    console.log(`📢 CASE 2: Created ${notifications.length} approval notifications for admins`);
    return notifications;
  } catch (error) {
    console.error('Error creating content approval notification:', error);
    throw error;
  }
};

// @desc    CASE 3: ADMIN APPROVES POST - Notify alumni
// @access  Internal
export const createPostApprovalNotification = async (postData, alumniId) => {
  try {
    const notification = await createNotification({
      receiver_id: alumniId,
      sender_id: null, // System notification
      role_target: 'alumni',
      department: postData.department || null,
      message: "Your post has been approved.",
      type: 'approval',
      reference_id: postData.id
    });
    
    console.log(`📢 CASE 3: Created approval notification for alumni`);
    return notification;
  } catch (error) {
    console.error('Error creating post approval notification:', error);
    throw error;
  }
};

// @desc    CASE 3: ADMIN REJECTS POST - Notify alumni
// @access  Internal
export const createPostRejectionNotification = async (postData, alumniId) => {
  try {
    const notification = await createNotification({
      receiver_id: alumniId,
      sender_id: null, // System notification
      role_target: 'alumni',
      department: postData.department || null,
      message: "Your post has been rejected.",
      type: 'rejection',
      reference_id: postData.id
    });
    
    console.log(`📢 CASE 3: Created rejection notification for alumni`);
    return notification;
  } catch (error) {
    console.error('Error creating post rejection notification:', error);
    throw error;
  }
};

// @desc    CASE 4: COORDINATOR CREATES POST - Notify admin
// @access  Internal
export const createCoordinatorPostNotification = async (postData, coordinatorId) => {
  try {
    // Find all admins
    const adminsQuery = `
      SELECT id, email
      FROM users 
      WHERE role = 'admin' AND is_approved = true
    `;
    
    const adminsResult = await pool.query(adminsQuery);
    const admins = adminsResult.rows;
    
    if (admins.length === 0) {
      console.log(`⚠️ No admins found for coordinator post notification`);
      return [];
    }
    
    const notifications = [];
    for (const admin of admins) {
      const notification = await createNotification({
        receiver_id: admin.id,
        sender_id: coordinatorId,
        role_target: 'admin',
        department: postData.department || null,
        message: "New post created by alumni. Approval required.",
        type: 'approval',
        reference_id: postData.id
      });
      notifications.push(notification);
    }
    
    console.log(`📢 CASE 4: Created ${notifications.length} notifications for admins (coordinator post)`);
    return notifications;
  } catch (error) {
    console.error('Error creating coordinator post notification:', error);
    throw error;
  }
};
