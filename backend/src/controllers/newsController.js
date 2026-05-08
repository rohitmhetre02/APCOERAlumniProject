import News from '../models/News.js';
import { validationResult } from 'express-validator';
import { sendCustomEmail } from '../services/emailService.js';
import { pool } from '../config/database.js';

// @desc    Create new news article
// @route   POST /api/news
// @access  Admin, Coordinator
export const createNews = async (req, res) => {
  try {
    console.log('🔍 News creation request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ News validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title, category, short_content, full_content,
      image_url, tags = [], featured = false
    } = req.body;

    const newsData = {
      title,
      category,
      short_content,
      full_content,
      image_url,
      author_id: req.user.id,
      author_role: req.user.role,
      tags,
      featured
    };

    const news = await News.create(newsData);

    // If coordinator created news, send notification to admin for approval
    if (req.user.role === 'coordinator') {
      try {
        const { createNotification } = await import('./notificationController.js');
        await createNotification({
          user_id: null, // For all admins
          message: `New news article submitted for approval: "${news.title}" by ${req.user.first_name} ${req.user.last_name} (${req.user.email}).`,
          type: 'news_approval',
          department: req.user.department
        });
        console.log(`📢 News approval notification sent to admins for: ${news.title}`);
      } catch (notificationError) {
        console.error('❌ Failed to send news approval notification:', notificationError.message);
      }
    }

    // If admin created news, send email to all alumni and coordinators
    if (req.user.role === 'admin') {
      try {
        console.log(`📧 Admin created news, sending notifications to all alumni and coordinators...`);
        
        // Get all active alumni and coordinators
        const recipientsQuery = `
          SELECT email, first_name, last_name, role 
          FROM users 
          WHERE (role = 'alumni' OR role = 'coordinator') 
          AND is_approved = true 
          AND status = 'active'
        `;
        const recipientsResult = await pool.query(recipientsQuery);
        
        if (recipientsResult.rows.length > 0) {
          console.log(`👥 Found ${recipientsResult.rows.length} active recipients to notify`);
          
          // Create email template for news notification
          const newsEmailTemplate = {
            subject: `📰 Latest News: ${news.title}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Latest News - APCOER Alumni</title>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
                  .content { padding: 20px; }
                  .news-title { color: #2c3e50; font-size: 24px; margin-bottom: 10px; }
                  .news-meta { color: #7f8c8d; font-size: 14px; margin-bottom: 20px; }
                  .news-content { margin-bottom: 20px; }
                  .footer { background: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>📰 APCOER Alumni News</h1>
                  <p>Stay updated with the latest from your alma mater</p>
                </div>
                <div class="content">
                  <h2 class="news-title">${news.title}</h2>
                  <div class="news-meta">
                    Category: ${news.category} | Published: ${new Date(news.created_at).toLocaleDateString()}
                  </div>
                  <div class="news-content">
                    ${news.short_content || news.full_content.substring(0, 200) + '...'}
                  </div>
                  <p>
                    <a href="http://localhost:3000/news/${news.id}" style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                      Read Full Article
                    </a>
                  </p>
                </div>
                <div class="footer">
                  <p>&copy; 2025 APCOER Alumni Portal. All rights reserved.</p>
                  <p>You received this email because you are an active member of the APCOER Alumni community.</p>
                </div>
              </body>
              </html>
            `
          };
          
          // Send individual emails to each recipient
          let sentCount = 0;
          let failedCount = 0;
          
          for (const recipient of recipientsResult.rows) {
            try {
              await sendCustomEmail(recipient.email, newsEmailTemplate.subject, newsEmailTemplate.html);
              sentCount++;
            } catch (error) {
              console.error(`❌ Failed to send news email to ${recipient.email}:`, error.message);
              failedCount++;
            }
          }
          
          console.log(`✅ News notification emails completed: ${sentCount}/${recipientsResult.rows.length} sent successfully`);
        } else {
          console.log(`ℹ️ No active recipients found to notify`);
        }
      } catch (emailError) {
        console.error('❌ Failed to send news notification emails:', emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: req.user.role === 'coordinator' 
        ? 'News article submitted successfully! It is now pending admin approval.'
        : 'News article created and published successfully! Notification emails have been sent to all alumni and coordinators.',
      data: news
    });
  } catch (error) {
    console.error('❌ Error creating news:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create news article',
      error: error.message
    });
  }
};

// @desc    Get all news articles
// @route   GET /api/news
// @access  Public
export const getAllNews = async (req, res) => {
  try {
    const { status, category, limit = 50, offset = 0 } = req.query;
    
    console.log('🔍 getAllNews called with:', { status, category, limit, offset });
    
    // For public access, only show approved news
    const newsStatus = status || 'approved';
    
    console.log('🔍 Fetching news with status:', newsStatus);
    const news = await News.getAll(newsStatus, category, parseInt(limit), parseInt(offset));
    console.log('✅ News fetched successfully, count:', news.length);

    res.json({
      success: true,
      message: 'News articles retrieved successfully',
      data: news,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: news.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching news:', error.message);
    console.error('❌ Full error details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news articles',
      error: error.message
    });
  }
};

// @desc    Get pending news articles (for admin approval)
// @route   GET /api/news/pending
// @access  Admin only
export const getPendingNews = async (req, res) => {
  try {
    const news = await News.getAll('pending');
    
    res.json({
      success: true,
      message: 'Pending news articles retrieved successfully',
      data: news
    });
  } catch (error) {
    console.error('❌ Error fetching pending news:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending news articles',
      error: error.message
    });
  }
};

// @desc    Get news by ID
// @route   GET /api/news/:id
// @access  Public
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    // Only show approved news to public
    if (news.status !== 'approved' && (!req.user || (req.user.id !== news.author_id && req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This news article is not published.'
      });
    }

    
    res.json({
      success: true,
      message: 'News article retrieved successfully',
      data: news
    });
  } catch (error) {
    console.error('❌ Error fetching news article:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news article',
      error: error.message
    });
  }
};

// @desc    Get news by slug
// @route   GET /api/news/slug/:slug
// @access  Public
export const getNewsBySlug = async (req, res) => {
  try {
    const news = await News.getBySlug(req.params.slug);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    // Only show approved news to public
    if (news.status !== 'approved' && (!req.user || (req.user.id !== news.author_id && req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This news article is not published.'
      });
    }

    
    res.json({
      success: true,
      message: 'News article retrieved successfully',
      data: news
    });
  } catch (error) {
    console.error('❌ Error fetching news article by slug:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news article',
      error: error.message
    });
  }
};

// @desc    Get news by author
// @route   GET /api/news/author/:authorId
// @access  Admin, Coordinator (own articles)
export const getNewsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { status } = req.query;

    // Check if user has permission to view these articles
    if (req.user.role === 'coordinator' && req.user.id !== authorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own articles.'
      });
    }

    const news = await News.getByAuthor(authorId, status);

    res.json({
      success: true,
      message: 'News articles retrieved successfully',
      data: news
    });
  } catch (error) {
    console.error('❌ Error fetching news by author:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news articles',
      error: error.message
    });
  }
};

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Admin, Coordinator (if creator)
export const updateNews = async (req, res) => {
  try {
    const news = await News.getById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    // Check if user has permission to update this article
    if (req.user.role === 'coordinator' && news.author_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own articles.'
      });
    }

    const updatedNews = await News.update(req.params.id, req.body);

    res.json({
      success: true,
      message: 'News article updated successfully',
      data: updatedNews
    });
  } catch (error) {
    console.error('❌ Error updating news article:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update news article',
      error: error.message
    });
  }
};

// @desc    Approve news article (admin only)
// @route   PUT /api/news/:id/approve
// @access  Admin only
export const approveNews = async (req, res) => {
  try {
    const news = await News.getById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    if (news.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'News article is not pending approval'
      });
    }

    const updatedNews = await News.updateStatus(req.params.id, 'approved');

    // Send notification to article author
    try {
      const { createNotification } = await import('./notificationController.js');
      await createNotification({
        user_id: news.author_id,
        message: `Your news article "${news.title}" has been approved and published!`,
        type: 'news_approved',
        department: news.department
      });
      console.log(`📢 Approval notification sent to news author for: ${news.title}`);
    } catch (notificationError) {
      console.error('❌ Failed to send approval notification:', notificationError.message);
    }

    res.json({
      success: true,
      message: 'News article approved and published successfully',
      data: updatedNews
    });
  } catch (error) {
    console.error('❌ Error approving news article:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to approve news article',
      error: error.message
    });
  }
};

// @desc    Reject news article (admin only)
// @route   PUT /api/news/:id/reject
// @access  Admin only
export const rejectNews = async (req, res) => {
  try {
    const news = await News.getById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    if (news.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'News article is not pending approval'
      });
    }

    const updatedNews = await News.updateStatus(req.params.id, 'rejected');

    // Send notification to article author
    try {
      const { createNotification } = await import('./notificationController.js');
      await createNotification({
        user_id: news.author_id,
        message: `Your news article "${news.title}" has been rejected. Please contact admin for details.`,
        type: 'news_rejected',
        department: news.department
      });
      console.log(`📢 Rejection notification sent to news author for: ${news.title}`);
    } catch (notificationError) {
      console.error('❌ Failed to send rejection notification:', notificationError.message);
    }

    res.json({
      success: true,
      message: 'News article rejected successfully',
      data: updatedNews
    });
  } catch (error) {
    console.error('❌ Error rejecting news article:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reject news article',
      error: error.message
    });
  }
};

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Admin, Coordinator (if creator)
export const deleteNews = async (req, res) => {
  try {
    const news = await News.getById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    // Check if user has permission to delete this article
    if (req.user.role === 'coordinator' && news.author_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own articles.'
      });
    }

    await News.delete(req.params.id);

    res.json({
      success: true,
      message: 'News article deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting news article:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news article',
      error: error.message
    });
  }
};

// @desc    Get news categories
// @route   GET /api/news/categories
// @access  Public
export const getNewsCategories = async (req, res) => {
  try {
    const categories = await News.getCategories();
    
    res.json({
      success: true,
      message: 'News categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    console.error('❌ Error fetching news categories:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news categories',
      error: error.message
    });
  }
};

// @desc    Get featured news
// @route   GET /api/news/featured
// @access  Public
export const getFeaturedNews = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const news = await News.getFeatured(parseInt(limit));
    
    res.json({
      success: true,
      message: 'Featured news retrieved successfully',
      data: news
    });
  } catch (error) {
    console.error('❌ Error fetching featured news:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured news',
      error: error.message
    });
  }
};

// Get news articles created by the current user
export const getMyNews = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let news;
    
    if (userRole === 'admin') {
      // Admin can see all news they created
      news = await News.getByAuthor(userId);
    } else if (userRole === 'coordinator') {
      // Coordinator can see their own news
      news = await News.getByAuthor(userId);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: news,
      message: 'Your news articles retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching user news:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your news articles',
      error: error.message
    });
  }
};

// @desc    Send news notification emails to all users
// @route   POST /api/news/send-news-notification
// @access  Admin
export const sendNewsNotification = async (req, res) => {
  try {
    const { newsId } = req.body;

    if (!newsId) {
      return res.status(400).json({
        success: false,
        message: 'News ID is required'
      });
    }

    // Get the news details
    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    // Get all users (alumni and coordinators)
    const User = (await import('../models/User.js')).default;
    const { Coordinator } = await import('../models/Coordinator.js');
    
    const [alumniUsers, coordinators] = await Promise.all([
      User.getAllUsers({ isApproved: true }),
      Coordinator.findAll()
    ]);

    // Combine all users (only approved and active)
    const allUsers = [
      ...alumniUsers.users.filter(user => user.is_approved && user.status === 'active').map(user => ({
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: 'alumni'
      })),
      ...coordinators.filter(coordinator => coordinator.is_approved).map(coordinator => ({
        email: coordinator.email,
        firstName: coordinator.first_name,
        lastName: coordinator.last_name,
        role: 'coordinator'
      }))
    ];

    // Import email service and template
    const { sendEmail } = await import('../services/emailService.js');
    const { getNewsNotificationTemplate } = await import('../utils/emailTemplates.js');

    // Prepare email content
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const { subject, html } = getNewsNotificationTemplate(news, loginUrl);

    // Send emails to all users with 2-second delay between each email
    const emailPromises = allUsers.map(async (user, index) => {
      // Add delay based on index (2 seconds per email)
      const delay = index * 2000;
      
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            await sendEmail(user.email, subject, html);
            resolve({ success: true, email: user.email });
          } catch (error) {
            resolve({ error: true, email: user.email });
          }
        }, delay);
      });
    });

    const results = await Promise.all(emailPromises);
    const successfulSends = results.filter(result => !result.error).length;
    const failedSends = results.filter(result => result.error).length;

    res.json({
      success: true,
      message: `News notification emails sent to ${successfulSends} users${failedSends > 0 ? ` (${failedSends} failed)` : ''}`,
      stats: {
        totalUsers: allUsers.length,
        successful: successfulSends,
        failed: failedSends
      }
    });

  } catch (error) {
    console.error('Error sending news notification emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send news notification emails',
      error: error.message
    });
  }
};
