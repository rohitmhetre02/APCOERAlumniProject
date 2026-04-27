import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { pool } from '../config/database.js';

// Ensure coordinator user exists
export const ensureCoordinatorExists = async () => {
  try {
    // Check if coordinator user exists
    const coordinatorEmail = 'coordinator@apcoer.edu';
    const existingCoordinator = await User.findByEmail(coordinatorEmail);
    
    if (existingCoordinator) {
      return existingCoordinator;
    }
    
    // Create coordinator user
    const coordinatorData = {
      email: coordinatorEmail,
      password: 'coordinator123', // Will be hashed in User.create
      firstName: 'Coordinator',
      lastName: 'User',
      role: 'coordinator',
      isApproved: true,
      department: 'Computer Engineering',
      contactNumber: '1234567890',
      passoutYear: 2020,
      status: 'active'
    };
    
    const newCoordinator = await User.create(coordinatorData);
    console.log(' Coordinator user created successfully:', coordinatorEmail);
    
    return newCoordinator;
  } catch (error) {
    console.error(' Error setting up coordinator:', error.message);
    throw error;
  }
};

// Generate coordinator token for testing
export const generateCoordinatorToken = (coordinator) => {
  return jwt.sign(
    { 
      id: coordinator.id, 
      email: coordinator.email, 
      role: coordinator.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
