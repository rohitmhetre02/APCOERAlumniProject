import { pool } from '../config/database.js';
import CloudinaryService from '../services/cloudinaryService.js';
import multer from 'multer';
import { Gallery } from '../models/index.js';

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all gallery images
export const getAllImages = async (req, res) => {
  try {
    const images = await Gallery.getAll();
    
    // Get uploader info for each image
    const imagesWithUploaders = await Promise.all(
      images.map(async (image) => {
        const userResult = await pool.query(
          'SELECT first_name, last_name, role FROM users WHERE id = $1',
          [image.uploaded_by]
        );
        const uploader = userResult.rows[0];
        return {
          ...image,
          uploader_name: uploader ? `${uploader.first_name} ${uploader.last_name}` : 'Unknown',
          uploader_role: uploader ? uploader.role : 'unknown'
        };
      })
    );

    res.json({
      success: true,
      message: 'Gallery images retrieved successfully',
      data: imagesWithUploaders
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery images',
      error: error.message
    });
  }
};

// Upload image to gallery
export const uploadImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user is admin or coordinator
    if (userRole !== 'admin' && userRole !== 'coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Only admin and coordinator can upload images'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await CloudinaryService.uploadImage(req.file.buffer);

    // Save to database
    const image = await Gallery.create({
      image_url: uploadResult.url,
      uploaded_by: userId
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: image
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};


// Delete image
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    // Check if user is admin or coordinator
    if (userRole !== 'admin' && userRole !== 'coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Only admin and coordinator can delete images'
      });
    }

    // Get image info before deletion
    const image = await Gallery.findById(id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from Cloudinary
    try {
      const publicId = image.image_url.split('/').pop().split('.')[0];
      const cloudinaryPublicId = `gallery/${publicId}`;
      await CloudinaryService.deleteImage(cloudinaryPublicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }

    // Delete from database
    await Gallery.delete(id);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

// Export upload middleware for routes
export { upload };
