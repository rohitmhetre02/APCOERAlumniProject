import express from 'express';
import { body } from 'express-validator';
import {
  register,
  loginAlumni,
  loginAdmin,
  getPendingAlumni,
  approveAlumni,
  resetPassword,
  getProfile,
  updateProfile,
  verifyPassword,
  sendEmailUpdateOTP,
  updateEmail,
  updatePassword,
  updatePasswordWithOTP,
  sendForgetPasswordOTP,
  verifyForgetPasswordOTP,
  deleteAccount
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules for registration
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('prnNumber')
    .trim()
    .matches(/^[0-9]{8}[A-Z]$/)
    .withMessage('PRN number must be in format: 8 digits followed by 1 uppercase letter (e.g., 72264568G)'),
  
  body('contactNumber')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Contact number must be exactly 10 digits'),
  
  body('department')
    .trim()
    .isIn([
      'Civil Engineering',
      'Computer Engineering',
      'Information Technology',
      'Electronics & Telecommunication Engineering',
      'Mechanical Engineering',
      'Artificial Intelligence & Data Science',
      'Electronics Engineering (VLSI Design And Technology)',
      'Electronics & Communication (Advanced Communication Technology)'
    ])
    .withMessage('Please select a valid department'),
  
  body('passoutYear')
    .trim()
    .isInt({ min: 2012, max: new Date().getFullYear() })
    .withMessage(`Passout year must be between 2012 and ${new Date().getFullYear()}`)
];

// Validation rules for login
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register new alumni
// @access  Public
router.post('/register', registerValidation, register);

// @route   POST /api/auth/login
// @desc    Login alumni
// @access  Public
router.post('/login', loginValidation, loginAlumni);

// @route   POST /api/auth/admin/login
// @desc    Login admin
// @access  Public
router.post('/admin/login', loginValidation, loginAdmin);

// @route   GET /api/auth/pending
// @desc    Get all pending alumni (admin only)
// @access  Private (Admin)
router.get('/pending', getPendingAlumni);

// @route   PATCH /api/auth/approve/:id
// @desc    Approve alumni (admin only)
// @access  Private (Admin)
router.patch('/approve/:id', approveAlumni);

// @route   PUT /api/auth/reset-password
// @desc    Reset password for first-time login
// @access  Private
router.put('/reset-password', authenticateToken, resetPassword);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, updateProfile);

// @route   POST /api/auth/verify-password
// @desc    Verify user password for sensitive operations
// @access  Private
router.post('/verify-password', authenticateToken, verifyPassword);

// @route   POST /api/auth/update-password
// @desc    Update user password
// @access  Private
router.post('/update-password', authenticateToken, updatePassword);

// @route   DELETE /api/auth/delete-account
// @desc    Delete user account
// @access  Private
router.delete('/delete-account', authenticateToken, deleteAccount);

// @route   POST /api/auth/update-password-with-otp
// @desc    Update password using OTP (forget password)
// @access  Private
router.post('/update-password-with-otp', authenticateToken, updatePasswordWithOTP);

// @route   POST /api/auth/send-forget-password-otp
// @desc    Send OTP for forget password
// @access  Private
router.post('/send-forget-password-otp', authenticateToken, sendForgetPasswordOTP);

// @route   POST /api/auth/verify-forget-password-otp
// @desc    Verify OTP for forget password
// @access  Private
router.post('/verify-forget-password-otp', authenticateToken, verifyForgetPasswordOTP);

// @route   POST /api/auth/send-email-update-otp
// @desc    Send OTP for email update
// @access  Private
router.post('/send-email-update-otp', authenticateToken, sendEmailUpdateOTP);

// @route   PUT /api/auth/update-email
// @desc    Update user email with OTP verification
// @access  Private
router.put('/update-email', authenticateToken, updateEmail);

export default router;
