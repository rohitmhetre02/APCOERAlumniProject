import { Coordinator } from '../models/Coordinator.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
import { pool } from '../config/database.js';
import { getCoordinatorApprovalTemplate, getRejectionTemplate } from '../utils/emailTemplates.js';

// Get all coordinators
export const getAllCoordinators = async (req, res) => {
  try {
    const coordinators = await Coordinator.findAll();
    res.json({
      success: true,
      message: 'Coordinators retrieved successfully',
      coordinators
    });
  } catch (error) {
    console.error('Error getting coordinators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve coordinators',
      error: error.message
    });
  }
};

// Create new coordinator
export const createCoordinator = async (req, res) => {
  try {
    const { fullName, email, contactNumber, department } = req.body;
    
    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';
    
    const coordinatorData = {
      first_name,
      last_name,
      email,
      contact_number: contactNumber,
      department
    };
    
    const result = await Coordinator.create(coordinatorData);
    
    // Send email to coordinator with credentials
    console.log(`📧 Preparing to send email to coordinator: ${email}`);
    console.log(`📧 Temporary password: ${result.temporaryPassword}`);
    
    try {
      const emailData = {
        to: email,
        subject: 'APCOER Coordinator Account Created',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1>APCOER Alumni Management System</h1>
              <h2>Coordinator Account Created</h2>
            </div>
            <div style="padding: 20px; background-color: #f9fafb;">
              <p>Dear ${first_name} ${last_name},</p>
              <p>Your coordinator account has been created by the APCOER Alumni Management System administrator.</p>
              <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h3>Account Status:</h3>
                <p><strong>Status:</strong> <span style="color: #d97706;">Inactive</span></p>
                <p>Your account will be activated after your first login and password reset.</p>
              </div>
              <div style="background-color: white; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0;">
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 3px;">${result.temporaryPassword}</code></p>
              </div>
              <p><strong>Important:</strong></p>
              <ul>
                <li>Use the above credentials to login for the first time</li>
                <li>You will be required to change your password on first login</li>
                <li>After password reset, your account will be activated</li>
                <li>Your department: ${department}</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/login" 
                   style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Login to Your Account
                </a>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };
      
      console.log(`📧 Email data prepared:`, {
        to: emailData.to,
        subject: emailData.subject,
        hasHtml: !!emailData.html
      });
      
      await sendEmail(emailData.to, emailData.subject, emailData.html);
      console.log(`✅ Email successfully sent to coordinator: ${email}`);
    } catch (emailError) {
      console.error('❌ Error sending email to coordinator:', emailError);
      console.error('❌ Email error details:', {
        message: emailError.message,
        stack: emailError.stack
      });
      // Don't fail the request if email fails, but log it
    }
    
    res.status(201).json({
      success: true,
      message: 'Coordinator created successfully and email sent',
      coordinator: result.coordinator
    });
  } catch (error) {
    console.error('Error creating coordinator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coordinator',
      error: error.message
    });
  }
};

// Delete coordinator
export const deleteCoordinator = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCoordinator = await Coordinator.delete(id);
    
    if (!deletedCoordinator) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Coordinator deleted successfully',
      coordinator: deletedCoordinator
    });
  } catch (error) {
    console.error('Error deleting coordinator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coordinator',
      error: error.message
    });
  }
};

// Reset coordinator password
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const coordinatorId = req.user.id;
    
    const updatedCoordinator = await Coordinator.updatePassword(coordinatorId, password);
    
    if (!updatedCoordinator) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator not found'
      });
    }
    
    console.log(`✅ Coordinator ${coordinatorId} password reset and status updated to active`);
    console.log('Updated coordinator details:', updatedCoordinator);
    
    res.json({
      success: true,
      message: 'Password reset successfully and account activated',
      coordinator: {
        ...updatedCoordinator,
        status: 'active' // Ensure status is explicitly set to active
      }
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// Get coordinator dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { department, role } = req.user;
    
    console.log('Fetching dashboard stats for user:', userId, 'role:', role, 'department:', department);
    
    const stats = await Coordinator.getDashboardStats(userId, department, role);
    
    console.log('Dashboard stats retrieved:', stats);
    
    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard stats',
      error: error.message
    });
  }
};

// Get users for approval (department-specific) - handles both all-users and pending-users
export const getPendingUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDepartment = req.user.department;
    const userRole = req.user.role;
    
    // Check if this is all-users or pending-users request
    const isAllUsersRequest = req.originalUrl.includes('/all-users');
    
    console.log(`Fetching ${isAllUsersRequest ? 'all' : 'pending'} users for ${userRole} ${userId} in department: ${userDepartment}`);
    
    let users;
    if (isAllUsersRequest) {
      // Get all users from coordinator's department
      users = await User.getAllUsersByDepartment(userDepartment);
      console.log(`Found ${users.length} total users in ${userDepartment} department`);
    } else {
      // Get only pending users from coordinator's department
      users = await User.getPendingAlumniByDepartment(userDepartment);
      console.log(`Found ${users.length} pending users in ${userDepartment} department`);
    }
    
    res.json({
      status: 'success',
      message: `${isAllUsersRequest ? 'All' : 'Pending'} users retrieved successfully`,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

// Get user details
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'User details retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user details',
      error: error.message
    });
  }
};

// Approve user
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update user status to active and is_approved to true
    const updatedUser = await User.update(id, {
      status: 'active',
      is_approved: true
    });
    
    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Send approval email
    try {
      const { subject, html } = getCoordinatorApprovalTemplate(updatedUser.first_name, updatedUser.last_name);
      await sendEmail(updatedUser.email, subject, html);
      console.log(`📧 Approval email sent to: ${updatedUser.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send approval email:', emailError);
    }
    
    res.json({
      status: 'success',
      message: 'User approved successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve user',
      error: error.message
    });
  }
};

// Reject user
export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user details before deleting
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Delete user
    const deleted = await User.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Send rejection email
    try {
      const { subject, html } = getRejectionTemplate(user.first_name, user.last_name);
      await sendEmail(user.email, subject, html);
      console.log(`📧 Rejection email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send rejection email:', emailError);
    }
    
    res.json({
      status: 'success',
      message: 'User rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject user',
      error: error.message
    });
  }
};

// Get coordinator notifications
export const getCoordinatorNotifications = async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    console.log('Fetching notifications for coordinator:', coordinatorId);
    
    const notificationsQuery = `
      SELECT id, message, type, created_at, is_read
      FROM notifications 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(notificationsQuery, [coordinatorId, limit, offset]);
    
    console.log('Notifications query result:', result.rows.length, 'notifications found');
    
    res.json({
      status: 'success',
      message: 'Notifications retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting coordinator notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    
    const unreadCountQuery = `
      SELECT COUNT(*) as unread_count
      FROM notifications 
      WHERE user_id = $1 AND is_read = false
    `;
    
    const result = await pool.query(unreadCountQuery, [coordinatorId]);
    
    res.json({
      status: 'success',
      message: 'Unread count retrieved successfully',
      data: { unreadCount: result.rows[0].unread_count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve unread count',
      error: error.message
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { id } = req.params;
    
    const updateQuery = `
      UPDATE notifications 
      SET is_read = true, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND user_id = $2
    `;
    
    await pool.query(updateQuery, [id, coordinatorId]);
    
    res.json({
      status: 'success',
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    
    const updateAllQuery = `
      UPDATE notifications 
      SET is_read = true, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $1 AND is_read = false
    `;
    
    await pool.query(updateAllQuery, [coordinatorId]);
    
    res.json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { id } = req.params;
    
    const deleteQuery = `
      DELETE FROM notifications 
      WHERE id = $1 AND user_id = $2
    `;
    
    await pool.query(deleteQuery, [id, coordinatorId]);
    
    res.json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};
