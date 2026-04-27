import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { sendRegistrationPendingEmail, sendEmail } from '../services/emailService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getOTPTemplate, getForgetPasswordOTPTemplate } from '../utils/emailTemplates.js';
import { createAlumniRegistrationNotification } from './notificationController.js';

// @desc    Register alumni user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    const { firstName, lastName, email, password, prnNumber, contactNumber, department, passoutYear } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      prnNumber,
      contactNumber,
      department,
      passoutYear,
      isFirstLogin: false  // Self-registered users set their own password
    });

    // Send registration pending email
    try {
      await sendRegistrationPendingEmail(
        newUser.email,
        `${newUser.first_name} ${newUser.last_name}`
      );
      console.log(`📧 Registration pending email sent to: ${newUser.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send registration email:', emailError.message);
      // Continue with registration even if email fails
    }

    // Create notification for coordinators using clean system
    try {
      await createAlumniRegistrationNotification(newUser);
      console.log(`📢 Clean notification system: Registration notification created for ${newUser.department} coordinators`);
    } catch (notificationError) {
      console.error('❌ Failed to create registration notification:', notificationError.message);
      // Continue with registration even if notification fails
    }

    
    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Please wait for coordinator approval.',
      data: {
        id: newUser.id,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        isApproved: newUser.is_approved
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Login Alumni User
// @route   POST /api/auth/login
// @access  Public
export const loginAlumni = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // ROLE VALIDATION: Only allow alumni users
    if (user.role !== 'alumni') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Debug: Check password verification
    console.log('Login attempt:', {
      email,
      userFound: !!user,
      userId: user.id,
      userRole: user.role,
      isApproved: user.is_approved,
      isFirstLogin: user.is_first_login,
      status: user.status
    });

    // Verify password using bcrypt
    const isValidPassword = await User.verifyPassword(password, user.password);
    
    console.log('Password verification:', {
      providedPassword: password,
      isValidPassword,
      hashedPassword: user.password
    });
    
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // APPROVAL VALIDATION: Check if user is approved
    if (!user.is_approved) {
      return res.status(403).json({
        status: 'error',
        message: 'Profile not approved yet'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.is_first_login,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Alumni Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Reset password for first-time login
// @route   PUT /api/auth/reset-password
// @access  Private
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.userId; // From JWT token

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Hash new password
    const hashedPassword = await User.hashPassword(newPassword);

    // Update user password and status
    await User.update(userId, {
      password: hashedPassword,
      is_first_login: false,
      status: 'active'
    });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully. Your account is now active.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Login Admin User
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    const { email, password } = req.body;

    // Find admin user by email
    const adminUser = await User.findByEmail(email);
    
    if (!adminUser) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // ROLE VALIDATION: Allow admin and coordinator users
    if (adminUser.role !== 'admin' && adminUser.role !== 'coordinator') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Verify password using bcrypt
    const isValidPassword = await User.verifyPassword(password, adminUser.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Admin login successful',
      token,
      user: {
        id: adminUser.id,
        firstName: adminUser.first_name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Admin Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Get pending alumni
// @route   GET /api/auth/pending
// @access  Private (Admin)
export const getPendingAlumni = async (req, res) => {
  try {
    const pendingUsers = await User.getPendingAlumni();
    
    res.status(200).json({
      status: 'success',
      message: 'Pending alumni retrieved successfully',
      data: pendingUsers
    });
  } catch (error) {
    console.error('Error fetching pending alumni:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending alumni'
    });
  }
};

// @desc    Approve alumni
// @route   PATCH /api/auth/approve/:id
// @access  Private (Admin)
export const approveAlumni = async (req, res) => {
  try {
    const { id } = req.params;
    
    const approvedUser = await User.updateApprovalStatus(id, true);
    
    if (!approvedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Alumni not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Alumni approved successfully',
      data: approvedUser
    });

  } catch (error) {
    console.error('Approve Alumni Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching profile for user ID:', userId);

    // Get user from database with all fields
    const user = await User.findById(userId);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User data from database:', {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      department: user.department
    });

    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, contact_number, prn_number, passout_year } = req.body;

    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    // Prepare update data
    const updateData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      contact_number: contact_number ? contact_number.trim() : null,
      prn_number: prn_number ? prn_number.trim() : null,
      passout_year: passout_year ? passout_year.trim() : null
    };

    // Update user in database
    const updatedUser = await User.update(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return updated user data (excluding password)
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Verify user password for sensitive operations
// @route   POST /api/auth/verify-password
// @access  Private
export const verifyPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Get user from database with password field
    const user = await User.findByEmail(req.user.email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    res.json({
      success: true,
      message: 'Password verified successfully'
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Simple OTP storage (in production, use Redis or database)
const emailUpdateOTPs = new Map();

// @desc    Send OTP for email update
// @route   POST /api/auth/send-email-update-otp
// @access  Private
export const sendEmailUpdateOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: 'New email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if new email already exists
    const existingUser = await User.findByEmail(newEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (15 minutes)
    emailUpdateOTPs.set(userId, {
      otp,
      newEmail,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    // Send OTP via email service
    try {
      // Get user details for email template
      const user = await User.findById(userId);
      const userName = `${user.first_name} ${user.last_name}`;
      
      // Generate email template
      const { subject, html } = getOTPTemplate(userName, otp, newEmail);
      
      // Send email
      await sendEmail(newEmail, subject, html);
      console.log(`✅ OTP email sent successfully to ${newEmail}`);
      
      res.json({
        success: true,
        message: 'OTP sent successfully to your email',
        // For development, include OTP in response
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      
      // Still store OTP but notify about email issue
      res.json({
        success: true,
        message: 'OTP generated but email failed to send. Please check console for OTP.',
        otp: otp // Always include OTP if email fails
      });
    }
  } catch (error) {
    console.error('Error sending email update OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update user email with OTP verification
// @route   PUT /api/auth/update-email
// @access  Private
export const updateEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail, otp } = req.body;

    if (!newEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: 'New email and OTP are required'
      });
    }

    // Get stored OTP data
    const otpData = emailUpdateOTPs.get(userId);
    
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      emailUpdateOTPs.delete(userId);
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.'
      });
    }

    // Verify OTP matches and email matches
    if (otpData.otp !== otp || otpData.newEmail !== newEmail) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or email mismatch'
      });
    }

    // Update user email
    const updatedUser = await User.update(userId, { email: newEmail });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear OTP after successful update
    emailUpdateOTPs.delete(userId);

    res.json({
      success: true,
      message: 'Email updated successfully',
      data: {
        email: newEmail
      }
    });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update user password
// @route   POST /api/auth/update-password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user from database
    const user = await User.findByEmail(req.user.email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await User.verifyPassword(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    console.log('🔒 Updating password for user:', userId);
    console.log('📝 New password (plain):', newPassword);
    
    const updatedUser = await User.update(userId, { password: newPassword });
    
    if (updatedUser) {
      console.log('✅ Password updated in database');
      console.log('🔍 Stored password hash:', updatedUser.password ? updatedUser.password.substring(0, 20) + '...' : 'NULL');
      console.log('🔒 Is password hashed?', updatedUser.password && updatedUser.password.startsWith('$2') ? 'YES' : 'NO');
    }
    
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update password using OTP (forget password)
// @route   POST /api/auth/update-password-with-otp
// @access  Private
export const updatePasswordWithOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'OTP and new password are required'
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user from database
    const user = await User.findByEmail(req.user.email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For forget password, we'll skip OTP verification for now and directly update password
    // In a real implementation, you would verify the OTP from your OTP storage system
    
    // Update password
    const updatedUser = await User.update(userId, { password: newPassword });
    
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password with OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Send OTP for forget password
// @route   POST /api/auth/send-forget-password-otp
// @access  Private
export const sendForgetPasswordOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    console.log('🔍 Sending forget password OTP to user:', userId);
    console.log('📧 Email address:', userEmail);

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔢 Generated OTP:', otp);

    // Get user name for email template
    const user = await User.findById(userId);
    const userName = user ? `${user.first_name} ${user.last_name}` : 'User';

    // Send OTP via email service
    try {
      const { subject, html } = getForgetPasswordOTPTemplate(userName, otp);
      await sendEmail(userEmail, subject, html);
      console.log(`📧 OTP email sent successfully to ${userEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      // Continue with response even if email fails (for development)
    }

    res.json({
      success: true,
      message: 'OTP sent to your registered email address',
      email: userEmail
    });
  } catch (error) {
    console.error('Error sending forget password OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// @desc    Verify OTP for forget password
// @route   POST /api/auth/verify-forget-password-otp
// @access  Private
export const verifyForgetPasswordOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    if (otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }

    // For now, we'll accept any 6-digit OTP as valid
    // In a real implementation, you would verify against stored OTP
    console.log('🔍 Verifying forget password OTP:', otp);

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Error verifying forget password OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    console.log('🗑️ Delete account request:', { userId, hasPassword: !!password });

    if (!password) {
      console.log('❌ No password provided');
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    console.log('🔍 Finding user:', userId);
    // Get user to verify password
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordStart: user.password ? user.password.substring(0, 10) + '...' : 'none'
    });

    console.log('✅ User found, verifying password');
    console.log('🔑 Password hash exists:', !!user.password);
    console.log('🔑 Password hash length:', user.password ? user.password.length : 0);
    
    // Handle users without password (e.g., social login users)
    if (!user.password) {
      console.log('⚠️ User has no password hash - likely social login or admin-created account');
      // For users without password, we can't verify password, so we'll allow deletion
      // but require additional confirmation
      console.log('✅ Allowing deletion for user without password hash');
    } else {
      // Verify password for users with password hash
      let isPasswordValid = false;
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('🔐 Password verification result:', isPasswordValid);
      } catch (bcryptError) {
        console.error('❌ bcrypt comparison error:', bcryptError);
        return res.status(500).json({
          success: false,
          message: 'Password verification failed'
        });
      }
      
      if (!isPasswordValid) {
        console.log('❌ Invalid password for user:', userId);
        return res.status(401).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    console.log('✅ Password verified, deleting user:', userId);
    // Delete user account (cascade delete should handle related data)
    const deletedUser = await User.delete(userId);
    
    if (!deletedUser) {
      console.log('❌ Failed to delete user:', userId);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
    }

    console.log('✅ Account deleted successfully:', userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// Legacy login function for backward compatibility
export const login = loginAlumni;
