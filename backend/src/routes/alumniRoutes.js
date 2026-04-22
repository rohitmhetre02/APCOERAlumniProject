import express from 'express';
import multer from 'multer';
import path from 'path';
import AlumniController from '../controllers/alumniController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all alumni with stats
router.get('/', authenticateToken, AlumniController.getAllAlumni);

// Get alumni directory (filtered) - public access for alumni users
router.get('/directory', AlumniController.getAlumniDirectory);

// Get alumni directory (filtered) - admin access
router.get('/admin-directory', authenticateToken, AlumniController.getAllAlumni);

// Add single alumni
router.post('/add', authenticateToken, AlumniController.addAlumni);

// Bulk upload alumni
router.post('/bulk-upload', authenticateToken, upload.single('file'), AlumniController.bulkUploadAlumni);

// Update alumni
router.put('/:id', authenticateToken, AlumniController.updateAlumni);

// Suspend alumni
router.put('/:id/suspend', authenticateToken, AlumniController.suspendAlumni);

// Activate alumni
router.put('/:id/activate', authenticateToken, AlumniController.activateAlumni);

// Delete alumni
router.delete('/:id', authenticateToken, AlumniController.deleteAlumni);

// Get department alumni stats
router.get('/department-stats', authenticateToken, AlumniController.getDepartmentStats);

export default router;
