import { validationResult } from 'express-validator';
import User from '../models/User.js';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Custom validation for email uniqueness
export const checkEmailExists = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Skip check for login (only for registration)
    if (req.path.includes('/login')) {
      return next();
    }
    
    const emailExists = await User.emailExists(email);
    
    if (emailExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered',
        field: 'email'
      });
    }
    
    next();
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during validation'
    });
  }
};

// Sanitize input data
export const sanitizeInput = (req, res, next) => {
  // Trim string fields
  if (req.body.firstName) {
    req.body.firstName = req.body.firstName.trim();
  }
  if (req.body.lastName) {
    req.body.lastName = req.body.lastName.trim();
  }
  if (req.body.email) {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  
  next();
};
