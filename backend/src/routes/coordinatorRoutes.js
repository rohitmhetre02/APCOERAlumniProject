import express from 'express';
import { authenticateToken, authenticateAdminOrCoordinator } from '../middleware/auth.js';
import { authenticateCoordinatorToken } from '../middleware/coordinatorAuth.js';
import { 
  getAllCoordinators, 
  createCoordinator, 
  deleteCoordinator, 
  resetPassword, 
  getDashboardStats,
  getPendingUsers,
  getUserDetails,
  approveUser,
  rejectUser,
  getCoordinatorNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/coordinatorController.js';

const router = express.Router();

// Admin routes for managing coordinators
router.get('/', authenticateToken, getAllCoordinators);
router.post('/', authenticateToken, createCoordinator);
router.delete('/:id', authenticateToken, deleteCoordinator);

// Coordinator routes
router.put('/reset-password', authenticateCoordinatorToken, resetPassword);
router.get('/dashboard/stats', authenticateAdminOrCoordinator, getDashboardStats);

// Profile approval routes
router.get('/all-users', authenticateAdminOrCoordinator, getPendingUsers);
router.get('/pending-users', authenticateAdminOrCoordinator, getPendingUsers);
router.get('/user/:id', authenticateAdminOrCoordinator, getUserDetails);
router.put('/approve-user/:id', authenticateAdminOrCoordinator, approveUser);
router.delete('/reject-user/:id', authenticateAdminOrCoordinator, rejectUser);

// Notification routes
router.get('/notifications', authenticateCoordinatorToken, getCoordinatorNotifications);
router.get('/notifications/unread-count', authenticateCoordinatorToken, getUnreadCount);
router.put('/notifications/:id/read', authenticateCoordinatorToken, markAsRead);
router.put('/notifications/read-all', authenticateCoordinatorToken, markAllAsRead);
router.delete('/notifications/:id', authenticateCoordinatorToken, deleteNotification);

export default router;
