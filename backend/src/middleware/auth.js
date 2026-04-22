import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

// Authenticate user middleware
export const authenticateToken = async (req, res, next) => {
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

        // Handle both userId and id fields for compatibility
        const userId = decoded.userId || decoded.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token structure. User ID not found.'
            });
        }

        // Check if user exists and is approved
        const userResult = await pool.query(
            'SELECT id, first_name, last_name, email, department, passout_year, role, is_approved FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        const user = userResult.rows[0];

        // For alumni directory access, allow any authenticated alumni user
        // For other routes, keep the approval check
        const isDirectoryRoute = req.originalUrl && req.originalUrl.includes('/directory');
        
        if (!isDirectoryRoute && !user.is_approved) {
            return res.status(401).json({
                success: false,
                message: 'Account not approved. Please wait for admin approval.'
            });
        }

        // Add user to request object
        req.user = {
            id: user.id,
            userId: user.id, // Add userId for compatibility
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            department: user.department,
            passout_year: user.passout_year,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        
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
            message: 'Internal server error during authentication.'
        });
    }
};

// Optional: Authenticate alumni specifically
export const authenticateAlumni = async (req, res, next) => {
    try {
        // First authenticate token
        await authenticateToken(req, res, async () => {
            // Check if user is alumni
            if (req.user.role !== 'alumni') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Alumni role required.'
                });
            }
            next();
        });
    } catch (error) {
        next(error);
    }
};

// Authenticate admin or coordinator
export const authenticateAdminOrCoordinator = async (req, res, next) => {
    try {
        // First authenticate token
        await authenticateToken(req, res, async () => {
            // Check if user is admin or coordinator
            if (req.user.role !== 'admin' && req.user.role !== 'coordinator') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin or Coordinator role required.'
                });
            }
            next();
        });
    } catch (error) {
        next(error);
    }
};
