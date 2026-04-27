import express from 'express';
import { getAllImages, uploadImage, deleteImage, upload } from '../controllers/galleryController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Get all images - accessible to all authenticated users (admin, coordinator, alumni)
router.get('/', authenticateUser, getAllImages);

// Upload image - admin and coordinator
router.post('/upload', authenticateUser, upload.single('image'), uploadImage);

// Delete image - admin and coordinator
router.delete('/:id', authenticateUser, deleteImage);

export default router;
