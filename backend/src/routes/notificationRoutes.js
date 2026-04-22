import express from 'express';
import { body } from 'express-validator';
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notificationController.js';
import { authenticateAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// @route   GET /api/admin/notifications
// @desc    Get all notifications
// @access  Admin
router.get('/', getAllNotifications);

// @route   GET /api/admin/notifications/unread-count
// @desc    Get unread notifications count
// @access  Admin
router.get('/unread-count', getUnreadCount);

// @route   PUT /api/admin/notifications/:id/read
// @desc    Mark notification as read
// @access  Admin
router.put('/:id/read', markNotificationAsRead);

// @route   PUT /api/admin/notifications/read-all
// @desc    Mark all notifications as read
// @access  Admin
router.put('/read-all', markAllNotificationsAsRead);

// @route   DELETE /api/admin/notifications/:id
// @desc    Delete notification
// @access  Admin
router.delete('/:id', deleteNotification);

export default router;
