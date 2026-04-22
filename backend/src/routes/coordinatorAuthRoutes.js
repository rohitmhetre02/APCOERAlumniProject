import express from 'express';
import jwt from 'jsonwebtoken';
import { Coordinator } from '../models/Coordinator.js';

const router = express.Router();

// Coordinator login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Verify coordinator credentials
    const coordinator = await Coordinator.verifyPassword(email, password);

    if (!coordinator) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: coordinator.id, 
        email: coordinator.email, 
        role: 'coordinator' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: coordinator.id,
        firstName: coordinator.first_name,
        lastName: coordinator.last_name,
        email: coordinator.email,
        role: 'coordinator',
        department: coordinator.department,
        isFirstLogin: coordinator.is_first_login
      }
    });
  } catch (error) {
    console.error('Coordinator login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

export default router;
