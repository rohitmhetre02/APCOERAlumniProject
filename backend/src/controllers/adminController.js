import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Opportunity from '../models/Opportunity.js';
import News from '../models/News.js';
import { sendApprovalEmail } from '../services/emailService.js';
import { pool } from '../config/database.js';

// Profile approval functions removed - now handled by coordinators only

// @desc    Get all users (admin dashboard)
// @route   GET /api/admin/users
// @access  Admin
// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isApproved } = req.query;
    
    const users = await User.getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      isApproved: isApproved === 'true' ? true : isApproved === 'false' ? false : undefined
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
};

// Reject user function removed - now handled by coordinators only

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.getDashboardStats();
    
    // Get event statistics
    const eventStatsQuery = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_events,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_events,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_events,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_events,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as monthly_events
      FROM events
    `;
    const eventStats = await pool.query(eventStatsQuery);
    
    // Get opportunity statistics
    const opportunityStatsQuery = `
      SELECT 
        COUNT(*) as total_opportunities,
        COUNT(*) FILTER (WHERE status = 'active') as active_opportunities,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_opportunities,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_opportunities,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_opportunities,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as monthly_opportunities,
        SUM(applications_count) as total_applications
      FROM opportunities
    `;
    const opportunityStats = await pool.query(opportunityStatsQuery);
    
    // Get news statistics
    const newsStatsQuery = `
      SELECT 
        COUNT(*) as total_news,
        COUNT(*) FILTER (WHERE status = 'published') as published_news,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_news,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_news,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as monthly_news
      FROM news
    `;
    const newsStats = await pool.query(newsStatsQuery);
    
    // Get alumni role breakdown
    const alumniRolesQuery = `
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      WHERE role = 'alumni' AND is_approved = true
      GROUP BY role
    `;
    const alumniRoles = await pool.query(alumniRolesQuery);
    
    // Get alumni department breakdown
    const alumniDepartmentsQuery = `
      SELECT 
        department,
        COUNT(*) as count
      FROM users 
      WHERE role = 'alumni' AND is_approved = true AND department IS NOT NULL
      GROUP BY department
      ORDER BY count DESC
    `;
    const alumniDepartments = await pool.query(alumniDepartmentsQuery);
    
    // Get pending approvals count
    const pendingApprovalsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM events WHERE status = 'pending') as pending_events,
        (SELECT COUNT(*) FROM opportunities WHERE status = 'pending') as pending_opportunities,
        (SELECT COUNT(*) FROM news WHERE status = 'draft') as draft_news,
        (SELECT COUNT(*) FROM users WHERE role = 'alumni' AND is_approved = false) as pending_alumni
    `;
    const pendingApprovals = await pool.query(pendingApprovalsQuery);
    
    const stats = {
      users: userStats,
      events: eventStats.rows[0],
      opportunities: opportunityStats.rows[0],
      news: newsStats.rows[0],
      alumniRoles: alumniRoles.rows,
      alumniDepartments: alumniDepartments.rows,
      pendingApprovals: pendingApprovals.rows[0]
    };
    
    res.status(200).json({
      status: 'success',
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

export default {
  getAllUsers,
  getDashboardStats
};
