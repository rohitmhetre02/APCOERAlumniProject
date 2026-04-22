import express from 'express';
import ApplicationController from '../controllers/applicationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authenticateAdminOrCoordinator } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = express.Router();

// Upload resume (protected route)
router.post('/upload-resume', authenticateToken, upload.single('resume'), ApplicationController.uploadResume);

// Submit application (protected route)
router.post('/apply', authenticateToken, ApplicationController.apply);

// Get user's applications (protected route)
router.get('/my-applications', authenticateToken, ApplicationController.getMyApplications);

// Get applications for a specific opportunity (protected route)
router.get('/opportunity/:opportunityId', authenticateToken, ApplicationController.getOpportunityApplications);

// Update application status (admin/coordinator only)
router.put('/:id/status', authenticateAdminOrCoordinator, ApplicationController.updateApplicationStatus);

// Get application statistics (admin/coordinator only)
router.get('/stats', authenticateAdminOrCoordinator, ApplicationController.getApplicationStats);

export default router;
