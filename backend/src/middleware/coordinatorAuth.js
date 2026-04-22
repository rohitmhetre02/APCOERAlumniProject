import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

// Authenticate coordinator for first-time login (password reset)
export const authenticateCoordinatorToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Handle both userId and id fields in token
        const coordinatorId = decoded.userId || decoded.id;
        console.log('Token decoded:', decoded);
        console.log('Coordinator ID extracted:', coordinatorId);

        // Check if coordinator exists (allow both approved and unapproved for password reset)
        const userResult = await pool.query(
            'SELECT id, email, role, is_approved, is_first_login, department FROM users WHERE id = $1 AND role = $2',
            [coordinatorId, 'coordinator']
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Coordinator not found.'
            });
        }

        const coordinator = userResult.rows[0];

        // Allow coordinators to access protected routes after successful login
        // No need to check is_first_login here - that's only for password reset flow
        // This middleware is for general coordinator authentication

        // Add coordinator to request object
        req.user = {
            id: coordinator.id,
            userId: coordinator.id, // Add both for compatibility
            email: coordinator.email,
            role: coordinator.role,
            is_approved: coordinator.is_approved,
            is_first_login: coordinator.is_first_login,
            department: coordinator.department
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};
