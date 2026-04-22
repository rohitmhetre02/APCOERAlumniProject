import express from 'express';
import { getAllImages, uploadImage, updateImage, deleteImage, upload } from '../controllers/galleryController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Get all images - accessible to all authenticated users (admin, coordinator, alumni)
router.get('/', authenticateUser, getAllImages);

// Upload image - admin only
router.post('/upload', authenticateAdmin, upload.single('image'), uploadImage);

// Update image - admin only
router.put('/:id', authenticateAdmin, updateImage);

// Delete image - admin only
router.delete('/:id', authenticateAdmin, deleteImage);

export default router;
