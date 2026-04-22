import express from 'express';
import { getUserById } from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user by ID (public for alumni directory)
// @route   GET /api/users/:id
// @access  Private (requires login)
router.get('/:id', authenticateToken, getUserById);

export default router;
