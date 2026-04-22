import express from 'express';
import { body } from 'express-validator';
import {
  createNews,
  getAllNews,
  getPendingNews,
  getNewsById,
  getNewsBySlug,
  getNewsByAuthor,
  updateNews,
  approveNews,
  rejectNews,
  deleteNews,
  getNewsCategories,
  getFeaturedNews,
  getMyNews,
  sendNewsNotification
} from '../controllers/newsController.js';
import { authenticateAdmin, authenticateCoordinator, authenticateAdminOrCoordinator } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Validation middleware
const newsValidation = [
  body('title').notEmpty().withMessage('News title is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('full_content').notEmpty().withMessage('Full content is required'),
  body('short_content').optional().isString().withMessage('Short content must be a string'),
  body('image_url').optional().isURL().withMessage('Image URL must be valid'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('featured').optional().isBoolean().withMessage('Featured must be boolean')
];

// Public routes
router.get('/', getAllNews);
router.get('/categories', getNewsCategories);
router.get('/featured', getFeaturedNews);
router.get('/slug/:slug', getNewsBySlug);
router.get('/:id', getNewsById);

// Protected routes
router.post('/', authenticateAdminOrCoordinator, newsValidation, createNews);
router.get('/author/:authorId', authenticateAdminOrCoordinator, getNewsByAuthor);
router.get('/my-news', authenticateAdminOrCoordinator, getMyNews);
router.put('/:id', authenticateAdminOrCoordinator, updateNews);
router.delete('/:id', authenticateAdminOrCoordinator, deleteNews);

// Admin only routes
router.get('/pending/list', authenticateAdmin, getPendingNews);
router.put('/:id/approve', authenticateAdmin, approveNews);
router.put('/:id/reject', authenticateAdmin, rejectNews);

// News notification route
router.post('/send-news-notification', authenticateAdmin, sendNewsNotification);

export default router;
