import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Authenticate admin middleware
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is admin (you can customize this logic)
    // For now, we'll consider the first registered user as admin
    // or you can add an 'is_admin' field to the users table
    const isAdmin = user.role === 'admin' || user.email === 'admin@apcoer.edu';
    
    if (!isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired.'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.'
    });
  }
};

// Authenticate admin or coordinator middleware
export const authenticateAdminOrCoordinator = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth Debug - Request URL:', req.url);
    console.log('🔐 Auth Debug - Auth Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth failed - No valid Bearer token');
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('🔑 Token decoded:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    console.log('👤 User found in database:', user ? {
      id: user.id,
      email: user.email,
      role: user.role
    } : 'User not found');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is admin or coordinator
    const isAdmin = user.role === 'admin' || user.email === 'admin@apcoer.edu';
    const isCoordinator = user.role === 'coordinator';
    
    console.log('👤 User Role Debug:', {
      userRole: user.role,
      userEmail: user.email,
      isAdmin,
      isCoordinator
    });
    
    if (!isAdmin && !isCoordinator) {
      console.log('❌ Access denied - User is neither admin nor coordinator');
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin or coordinator privileges required.'
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    };

    console.log('✅ Admin/Coordinator authentication successful for:', user.email, 'Role:', user.role);
    next();
  } catch (error) {
    console.error('Admin/Coordinator authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired.'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.'
    });
  }
};

// Optional: Create admin user if it doesn't exist
export const ensureAdminExists = async () => {
  try {
    console.log('🚀 Starting admin setup process...');
    const adminEmail = 'admin@apcoer.edu';
    console.log('🔍 Checking for admin user:', adminEmail);
    
    let adminUser = await User.findByEmail(adminEmail);
    console.log('🔍 User.findByEmail result:', adminUser ? 'Found' : 'Not found');
    
    if (!adminUser) {
      console.log('❌ Admin user not found, creating new admin user...');
      console.log('🔧 Connecting to database for admin creation...');
      
      // Create admin user with direct database query (only basic fields)
      const { pool } = await import('../config/database.js');
      console.log('✅ Database connection established');
      
      console.log('🔧 Hashing admin password...');
      const saltRounds = 12;
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('Admin@123', saltRounds);
      console.log('✅ Password hashed successfully');
      
      console.log('🔧 Executing admin INSERT query...');
      const adminQuery = `
        INSERT INTO users (first_name, last_name, email, password, role, is_approved, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, first_name, last_name, email, role, is_approved, created_at
      `;
      
      const result = await pool.query(adminQuery, [
        'Admin',
        'User', 
        adminEmail,
        hashedPassword,
        'admin',
        true
      ]);
      
      adminUser = result.rows[0];
      console.log('✅ Admin user created successfully:', adminEmail);
      console.log('🔑 Default password: Admin@123 (change this in production)');
      console.log('📋 Admin credentials saved with basic fields only');
      console.log('📋 Created admin details:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        isApproved: adminUser.is_approved
      });
    } else {
      console.log('👤 Admin user found:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        isApproved: adminUser.is_approved
      });
      
      // Check if existing admin user has correct role and approval
      if (adminUser.role !== 'admin' || !adminUser.is_approved) {
        console.log('⚠️ Admin user has incorrect role or approval, updating...');
        console.log('Current role:', adminUser.role, 'Current approval:', adminUser.is_approved);
        
        // Update admin user to ensure correct role and approval
        try {
          // Direct database query to update both role and approval
          const { pool } = await import('../config/database.js');
          const updateQuery = `
            UPDATE users 
            SET role = 'admin', is_approved = true, updated_at = CURRENT_TIMESTAMP
            WHERE email = $1
            RETURNING id, first_name, last_name, email, role, is_approved
          `;
          
          const result = await pool.query(updateQuery, [adminEmail]);
          
          if (result.rows.length > 0) {
            adminUser = result.rows[0];
            console.log('✅ Admin user updated with correct role and approval:', adminEmail);
            console.log('Updated role:', adminUser.role, 'Updated approval:', adminUser.is_approved);
          } else {
            console.log('❌ Failed to update admin user - no rows returned');
          }
        } catch (updateError) {
          console.error('Error updating admin user:', updateError.message);
        }
      } else {
        console.log('✅ Admin user already exists and is properly configured:', adminEmail);
      }
    }
    
    console.log('📋 Final admin user details:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      isApproved: adminUser.is_approved
    });
    
    console.log('🎉 Admin setup process completed successfully!');
    return adminUser;
  } catch (error) {
    console.error('❌ Error ensuring admin exists:', error.message);
    console.error('❌ Full error details:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
};

// Authenticate any user (for alumni access)
export const authenticateUser = async (req, res, next) => {
  try {
    console.log('🔧 authenticateUser middleware called');
    console.log('🔧 Request URL:', req.url);
    console.log('🔧 Request method:', req.method);
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. User not found.'
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('User authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired.'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.'
    });
  }
};

// Authenticate coordinator middleware
export const authenticateCoordinator = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is coordinator
    const isCoordinator = user.role === 'coordinator';
    
    if (!isCoordinator) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Coordinator privileges required.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Coordinator authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired.'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.'
    });
  }
};

export default {
  authenticateAdmin,
  authenticateCoordinator,
  authenticateAdminOrCoordinator,
  authenticateUser,
  ensureAdminExists
};
