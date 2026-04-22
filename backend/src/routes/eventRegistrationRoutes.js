import express from 'express';
import EventRegistrationController from '../controllers/eventRegistrationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authenticateAdminOrCoordinator } from '../middleware/auth.js';

const router = express.Router();

// Register for an event (protected route)
router.post('/register', authenticateToken, EventRegistrationController.register);

// Get user's event registrations (protected route)
router.get('/my-registrations', authenticateToken, EventRegistrationController.getMyRegistrations);

// Get registrations for a specific event (protected route)
router.get('/event/:eventId', authenticateToken, EventRegistrationController.getEventRegistrations);

// Cancel registration (protected route)
router.put('/:registrationId/cancel', authenticateToken, EventRegistrationController.cancelRegistration);

// Get registration statistics (admin/coordinator only)
router.get('/stats', authenticateAdminOrCoordinator, EventRegistrationController.getRegistrationStats);

export default router;
