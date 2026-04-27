import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get notifications for logged-in user
// @access  Private
router.get('/', authenticateToken, getUserNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticateToken, markNotificationAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read for user
// @access  Private
router.put('/read-all', authenticateToken, markAllNotificationsAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', authenticateToken, deleteNotification);

export default router;
