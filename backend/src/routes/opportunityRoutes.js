import express from 'express';
import {
  getAllOpportunities,
  getPendingOpportunities,
  approveOpportunity,
  rejectOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  applyForOpportunity,
  getOpportunityById,
  getOpportunityApplications,
  acceptApplication,
  rejectApplication,
  getMyOpportunities
} from '../controllers/opportunityController.js';
import {
  getOpportunityApplications as getApplications,
  updateApplicationStatus,
  downloadResume
} from '../controllers/opportunityApplicationController.js';
import { authenticateAdmin, authenticateCoordinator, authenticateAdminOrCoordinator, authenticateUser } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public route for alumni to view all opportunities
router.get('/', getAllOpportunities);

// Public route for alumni to view approved opportunities only
router.get('/approved', getAllOpportunities);

// @route   POST /api/opportunities
// @desc    Create new opportunity (alumni)
// @access  Alumni
router.post('/', authenticateUser, createOpportunity);

// @route   GET /api/opportunities/my-opportunities
// @desc    Get current user's opportunities (alumni)
// @access  Alumni
router.get('/my-opportunities', authenticateUser, getMyOpportunities);

// @route   GET /api/opportunities/pending
// @desc    Get pending opportunities (admin only)
// @access  Admin
router.get('/pending', authenticateAdmin, getPendingOpportunities);


// Public route to get single opportunity by ID
router.get('/:id', getOpportunityById);

// Protected route for alumni to apply
router.post('/:id/apply', authenticateUser, applyForOpportunity);

// Routes to get and manage applications for an opportunity (alumni routes)
router.put('/applications/:applicationId/accept', authenticateUser, acceptApplication);
router.put('/applications/:applicationId/reject', authenticateUser, rejectApplication);

// Routes for alumni to edit/delete their own opportunities
router.put('/:id', authenticateUser, updateOpportunity);
router.delete('/:id', authenticateUser, deleteOpportunity);

// Admin/Coordinator protected routes
router.use(authenticateAdminOrCoordinator);

// @route   PUT /api/opportunities/:id/approve
// @desc    Approve opportunity (admin only)
// @access  Admin
router.put('/:id/approve', authenticateAdmin, approveOpportunity);

// @route   PUT /api/opportunities/:id/reject
// @desc    Reject opportunity (admin only)
// @access  Admin
router.put('/:id/reject', authenticateAdmin, rejectOpportunity);

// @route   POST /api/opportunities
// @desc    Create new opportunity
// @access  Admin, Coordinator
router.post('/', createOpportunity);

// Application Management Routes

// @route   GET /api/opportunities/:opportunityId/applications
// @desc    Get all applications for a specific opportunity
// @access  Admin, Coordinator
router.get('/:opportunityId/applications', authenticateAdminOrCoordinator, getApplications);

// @route   PUT /api/opportunities/applications/:applicationId/status
// @desc    Update application status
// @access  Admin, Coordinator
router.put('/applications/:applicationId/status', authenticateAdminOrCoordinator, updateApplicationStatus);

// @route   GET /api/opportunities/applications/:applicationId/resume
// @desc    Download application resume
// @access  Admin, Coordinator
router.get('/applications/:applicationId/resume', authenticateAdminOrCoordinator, downloadResume);

export default router;
