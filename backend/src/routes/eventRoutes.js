import express from 'express';
import { body } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';
import {
  createEvent,
  getAllEvents,
  getPendingEvents,
  getApprovedEvents,
  getEventById,
  approveEvent,
  rejectEvent,
  deleteEvent,
  updateEvent,
  getEventRegistrations,
  getMyEventRegistrations,
  acceptRegistration,
  rejectRegistration,
  debugAlumniEmail,
  testAlumniCount,
  debugAdminEventEmail,
  getMyEvents
} from '../controllers/eventController.js';
import { authenticateAdmin, authenticateCoordinator, authenticateAdminOrCoordinator, authenticateUser } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Validation middleware
const eventValidation = [
  body('title').notEmpty().withMessage('Event title is required'),
  body('event_date').isISO8601().withMessage('Valid event date is required'),
  body('event_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('event_mode').isIn(['online', 'offline', 'hybrid']).withMessage('Valid event mode is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
  body('event_type').isIn(['Workshop', 'Networking', 'Educational', 'Social', 'Showcase', 'other']).withMessage('Valid event type is required'),
  body('guest_speakers').isArray().optional().withMessage('Guest speakers must be an array'),
  body('guest_speakers.*.name').notEmpty().withMessage('Guest speaker name is required'),
  body('guest_speakers.*.topic').notEmpty().withMessage('Guest speaker topic is required'),
  body('guest_speakers.*.role').notEmpty().withMessage('Guest speaker role is required')
];

// Public routes
router.get('/approved', getApprovedEvents);

// @route   POST /api/events
// @desc    Create new event (alumni)
// @access  Alumni
router.post('/', authenticateUser, createEvent);

// @route   GET /api/events/my-events
// @desc    Get current user's events (alumni)
// @access  Alumni
router.get('/my-events', authenticateUser, getMyEvents);

// @route   POST /api/events/upload-image
// @desc    Upload image to Cloudinary (alumni)
// @access  Alumni
router.post('/upload-image', authenticateUser, async (req, res) => {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Check if image data is provided
    if (!req.body.image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    console.log('📤 Alumni uploading image to Cloudinary...');

    // Upload image with proper options for base64
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'alumni_event_images',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      max_file_size: 5000000, // 5MB
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    console.log('✅ Alumni image uploaded successfully:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('❌ Alumni Cloudinary upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Failed to upload image: ' + error.message
    });
  }
});


// @route   GET /api/events/pending
// @desc    Get pending events (admin only)
// @access  Admin
router.get('/pending', authenticateAdmin, getPendingEvents);

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Authenticated users (alumni, admin, coordinator)
router.get('/:id', authenticateUser, getEventById);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Event creator only
router.put('/:id', authenticateUser, updateEvent);

// Protected routes (admin or coordinator)
router.use(authenticateAdminOrCoordinator); // This middleware will handle both admin and coordinator

// @route   POST /api/events/admin
// @desc    Create new event (admin/coordinator)
// @access  Admin, Coordinator
router.post('/admin', eventValidation, createEvent);

// @route   GET /api/events
// @desc    Get all events
// @access  Admin, Coordinator
router.get('/', getAllEvents);

// @route   PUT /api/events/:id/approve
// @desc    Approve event (admin only)
// @access  Admin
router.put('/:id/approve', authenticateAdmin, approveEvent);

// @route   PUT /api/events/:id/reject
// @desc    Reject event (admin only)
// @access  Admin
router.put('/:id/reject', authenticateAdmin, rejectEvent);

// @route   POST /api/events/upload-image
// @desc    Upload image to Cloudinary
// @access  Admin, Coordinator
router.post('/upload-image', authenticateAdminOrCoordinator, async (req, res) => {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Check if image data is provided
    if (!req.body.image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    console.log('📤 Uploading image to Cloudinary...');

    // Upload image with proper options for base64
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'event_images',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      max_file_size: 5000000, // 5MB
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    console.log('✅ Image uploaded successfully:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload image: ' + error.message
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Admin, Coordinator (if creator)
router.delete('/:id', deleteEvent);

// @route   GET /api/events/:id/my-registrations
// @desc    Get registrations for alumni's own event (fetch only)
// @access  Event creator (alumni) only
router.get('/:id/my-registrations', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`🔧 Simple fetch: Getting registrations for event ${id}, user ${userId}`);

    // Get the event and check ownership
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only allow event creators to view their own registrations
    if (event.created_by !== userId) {
      console.log(`❌ Access denied - User ${userId} is not creator of event ${id}`);
      return res.status(403).json({
        success: false,
        message: 'You can only view registrations for your own events'
      });
    }

    // Get registrations for this event
    const registrations = await EventRegistration.getByEventId(id);
    console.log(`✅ Found ${registrations.length} registrations for event ${id}`);

    res.json({
      success: true,
      data: registrations,
      message: 'Registrations retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching registrations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
});

// @route   GET /api/events/:id/registrations
// @desc    Get registrations for a specific event
// @access  Event creator only
router.get('/:id/registrations', authenticateUser, getEventRegistrations);

// @route   PUT /api/events/registrations/:registrationId/accept
// @desc    Accept a registration
// @access  Event creator only
router.put('/registrations/:registrationId/accept', authenticateUser, acceptRegistration);

// @route   PUT /api/events/registrations/:registrationId/reject
// @desc    Reject a registration
// @access  Event creator only
router.put('/registrations/:registrationId/reject', authenticateUser, rejectRegistration);

// @route   GET /api/events/debug/alumni-email
// @desc    Debug alumni email system
// @access  Admin
router.get('/debug/alumni-email', authenticateAdmin, debugAlumniEmail);

// @route   GET /api/events/test/alumni-count
// @desc    Test alumni count
// @access  Admin
router.get('/test/alumni-count', authenticateAdmin, testAlumniCount);

// @route   GET /api/events/debug/admin-event-email
// @desc    Debug admin event email system
// @access  Admin
router.get('/debug/admin-event-email', authenticateAdmin, debugAdminEventEmail);

export default router;
