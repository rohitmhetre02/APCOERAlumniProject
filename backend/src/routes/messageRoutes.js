import express from 'express';
import {
  sendMessage, 
  getMessages, 
  getAlumniList, 
  getCoordinatorList,
  getUnreadCount,
  getContacts,
  getConversations
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/messages/alumni-list
// @desc    Get alumni list for admin/coordinator messaging
// @access  Private (Admin/Coordinator)
router.get('/alumni-list', authenticateToken, getAlumniList);

// @route   GET /api/messages/coordinator-list
// @desc    Get coordinator list for admin messaging
// @access  Private (Admin)
router.get('/coordinator-list', authenticateToken, getCoordinatorList);

// @route   GET /api/messages/contacts
// @desc    Get contacts (Admin + Coordinator) for alumni
// @access  Private (Alumni)
router.get('/contacts', authenticateToken, getContacts);

// @route   GET /api/messages/unread-count
// @desc    Get unread message count for current user
// @access  Private
router.get('/unread-count', authenticateToken, getUnreadCount);

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', authenticateToken, getConversations);

// @route   GET /api/messages/:receiverId
// @desc    Get messages between logged-in user and another user
// @access  Private
router.get('/:receiverId', authenticateToken, getMessages);

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', authenticateToken, sendMessage);

export default router;
