import express from 'express';
import { body } from 'express-validator';
import {
  getOpportunityApplications,
  updateApplicationStatus,
  downloadResume
} from '../controllers/opportunityApplicationController.js';
import { authenticateAdmin, authenticateCoordinator, authenticateAdminOrCoordinator } from '../middleware/adminMiddleware.js';

const router = express.Router();

// @desc    Get all applications for a specific opportunity
// @route   GET /api/opportunities/:opportunityId/applications
// @access  Admin, Coordinator
router.get('/:opportunityId/applications', authenticateAdminOrCoordinator, getOpportunityApplications);

// @desc    Update application status
// @route   PUT /api/opportunities/applications/:applicationId/status
// @access  Admin, Coordinator
router.put('/applications/:applicationId/status', authenticateAdminOrCoordinator, updateApplicationStatus);

// @desc    Download application resume
// @route   GET /api/opportunities/applications/:applicationId/resume
// @access  Admin, Coordinator
router.get('/applications/:applicationId/resume', authenticateAdminOrCoordinator, downloadResume);

export default router;
