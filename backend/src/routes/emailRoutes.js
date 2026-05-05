// Email Routes - Production Ready API Routes
import express from 'express';
import {
  sendSingleEmail,
  sendBulkEmails,
  sendTemplateEmail,
  getQueueStatistics,
  pauseEmailQueue,
  resumeEmailQueue,
  clearEmailQueue,
  healthCheck,
  getServiceStatus,
  testEmail
} from '../controllers/emailController.js';
import { validateEmailRequest } from '../utils/emailValidator.js';

const router = express.Router();

// Send single email
router.post('/send', validateEmailRequest, sendSingleEmail);

// Send bulk emails
router.post('/send-bulk', validateEmailRequest, sendBulkEmails);

// Send template-based email
router.post('/send-template', validateEmailRequest, sendTemplateEmail);

// Get queue statistics
router.get('/stats', getQueueStatistics);

// Queue management endpoints
router.post('/pause', pauseEmailQueue);
router.post('/resume', resumeEmailQueue);
router.post('/clear', clearEmailQueue);

// Health check endpoint
router.get('/health', healthCheck);

// Get service status
router.get('/status', getServiceStatus);

// Test email endpoint (development/testing)
router.post('/test', testEmail);

export default router;
