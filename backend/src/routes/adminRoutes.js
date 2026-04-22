import express from 'express';
import { body, param } from 'express-validator';
import {
  getAllUsers,
  getDashboardStats
} from '../controllers/adminController.js';
// Notification imports removed - only coordinators receive registration notifications
import { authenticateAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Admin middleware - protect all admin routes
router.use(authenticateAdmin);

// Profile approval routes removed - now handled by coordinators only

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Admin
router.get('/users', getAllUsers);

// Reject user route removed - now handled by coordinators only

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Admin
router.get('/dashboard', getDashboardStats);

// Notification routes removed - only coordinators receive registration notifications

export default router;
