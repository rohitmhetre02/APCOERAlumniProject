import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { sendRegistrationPendingEmail } from '../services/emailService.js';
import jwt from 'jsonwebtoken';

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

    // Create department-specific notification for coordinators
    try {
      const { createDepartmentNotification, createNotification } = await import('./notificationController.js');
      
      // Send to same-department coordinators
      await createDepartmentNotification({
        department: newUser.department,
        message: `New alumni registered in ${newUser.department}: ${newUser.first_name} ${newUser.last_name} (${newUser.email}). Approval required.`,
        type: 'approval',
        user_email: newUser.email
      });
      console.log(`📢 Department-specific notification created for ${newUser.department} coordinators: ${newUser.email}`);
      
      // Send notification to admins
      await createNotification({
        user_id: null, // For all admins
        message: `New alumni registration: ${newUser.first_name} ${newUser.last_name} (${newUser.email}) from ${newUser.department} department.`,
        type: 'registration',
        department: newUser.department
      });
      console.log(`📢 Admin notification created for registration: ${newUser.email}`);
      
    } catch (notificationError) {
      console.error('❌ Failed to create notifications:', notificationError.message);
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

// Legacy login function for backward compatibility
export const login = loginAlumni;
