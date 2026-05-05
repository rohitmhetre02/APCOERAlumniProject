import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendCustomEmail } from '../services/emailService.js';

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

class ApplicationController {
  // Upload resume
  static async uploadResume(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileUrl = `/uploads/resumes/${req.file.filename}`;
      
      res.json({
        success: true,
        url: fileUrl,
        message: 'Resume uploaded successfully'
      });
    } catch (error) {
      console.error('❌ Error uploading resume:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload resume'
      });
    }
  }

  // Submit application
  static async apply(req, res) {
    try {
      const { opportunity_id, contact_number, proposal, resume_url } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!opportunity_id || !contact_number || !resume_url) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: opportunity_id, contact_number, resume_url'
        });
      }

      // Check if opportunity exists and is approved
      const opportunity = await Opportunity.findById(opportunity_id);
      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      if (opportunity.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'This opportunity is not available for application'
        });
      }

      // Check if user has already applied
      const existingApplication = await Application.checkExistingApplication(userId, opportunity_id);
      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this opportunity'
        });
      }

      // Create application
      const applicationData = {
        opportunity_id,
        user_id: userId,
        contact_number,
        proposal: proposal || null,
        resume_url,
        status: 'pending'
      };

      const application = await Application.create(applicationData);

      // Update opportunity applications count
      await Opportunity.incrementApplicationsCount(opportunity_id);

      res.status(201).json({
        success: true,
        data: application,
        message: 'Application submitted successfully'
      });

    } catch (error) {
      console.error('❌ Error submitting application:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        opportunity_id: req.body?.opportunity_id,
        user_id: req.user?.id
      });
      res.status(500).json({
        success: false,
        message: 'Failed to submit application: ' + error.message
      });
    }
  }

  // Get user's applications
  static async getMyApplications(req, res) {
    try {
      const userId = req.user.id;

      const applications = await Application.getByUserId(userId);

      res.json({
        success: true,
        data: applications,
        message: 'Applications retrieved successfully'
      });

    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications'
      });
    }
  }

  // Get applications for an opportunity (for employers/admins)
  static async getOpportunityApplications(req, res) {
    try {
      const { opportunityId } = req.params;
      
      console.log('🔧 getOpportunityApplications called with opportunityId:', opportunityId);
      console.log('🔧 User making request:', { id: req.user?.id, email: req.user?.email, role: req.user?.role });

      // Check if opportunity exists
      const opportunity = await Opportunity.getById(opportunityId);
      console.log('🔧 Opportunity found:', !!opportunity);
      if (opportunity) {
        console.log('🔧 Opportunity details:', { id: opportunity.id, title: opportunity.title });
      }
      
      if (!opportunity) {
        console.log('🔧 Opportunity not found, returning 404');
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      console.log('🔧 About to call Application.getByOpportunityId...');
      const applications = await Application.getByOpportunityId(opportunityId);
      console.log('🔧 Found applications:', applications.length);
      console.log('🔧 Applications data returned:', applications);
      if (applications.length > 0) {
        console.log('🔧 First application details:', {
          id: applications[0].id,
          first_name: applications[0].first_name,
          last_name: applications[0].last_name,
          email: applications[0].email,
          department: applications[0].department,
          passout_year: applications[0].passout_year,
          contact_number: applications[0].contact_number,
          proposal: applications[0].proposal,
          status: applications[0].status
        });
      }

      const responseData = {
        success: true,
        data: applications,
        message: 'Applications retrieved successfully'
      };
      
      console.log('🔧 Sending response:', {
        success: responseData.success,
        applicationsCount: responseData.data?.length,
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title
      });

      res.json(responseData);

    } catch (error) {
      console.error('❌ Error fetching opportunity applications:', error.message);
      console.error('❌ Full error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: error.message
      });
    }
  }

  // Update application status (for employers/admins)
  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const validStatuses = ['pending', 'under_review', 'shortlisted', 'rejected', 'accepted'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const application = await Application.updateStatus(id, status);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Send email notification based on status change
      try {
        // Get application details with user and opportunity info
        const applicationDetails = await Application.findById(id);
        
        if (applicationDetails && applicationDetails.user_id && applicationDetails.opportunity_id) {
          // Get user details
          const userQuery = `
            SELECT first_name, last_name, email 
            FROM users 
            WHERE id = $1
          `;
          const userResult = await Application.pool.query(userQuery, [applicationDetails.user_id]);
          
          // Get opportunity details
          const opportunityQuery = `
            SELECT title, company 
            FROM opportunities 
            WHERE id = $1
          `;
          const opportunityResult = await Application.pool.query(opportunityQuery, [applicationDetails.opportunity_id]);
          
          if (userResult.rows.length > 0 && opportunityResult.rows.length > 0) {
            const userName = `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`;
            const userEmail = userResult.rows[0].email;
            const opportunityTitle = opportunityResult.rows[0].title;
            const company = opportunityResult.rows[0].company;

            if (status === 'under_review') {
              const subject = `📋 Your Application is Under Review - ${opportunityTitle}`;
              const html = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Application Under Review</title>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: #f39c12; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .status-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { background: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>📋 Application Update</h1>
                    <p>APCOER Alumni Portal</p>
                  </div>
                  <div class="content">
                    <h2>Dear ${userName},</h2>
                    <p>Your application for the position of <strong>${opportunityTitle}</strong> at <strong>${company}</strong> is currently under review.</p>
                    
                    <div class="status-box">
                      <h3>📋 Application Status: Under Review</h3>
                      <p>Our team is carefully reviewing your application. We will notify you once a decision has been made.</p>
                    </div>
                    
                    <p>Thank you for your interest in this opportunity. We appreciate your patience during the review process.</p>
                    
                    <p>Best regards,<br>APCOER Alumni Team</p>
                  </div>
                  <div class="footer">
                    <p>&copy; 2025 APCOER Alumni Portal. All rights reserved.</p>
                  </div>
                </body>
                </html>
              `;
              
              await sendCustomEmail(userEmail, subject, html);
              console.log(`📧 Review email sent to: ${userEmail}`);
              
            } else if (status === 'accepted') {
              const subject = `🎉 Congratulations! Your Application Has Been Accepted - ${opportunityTitle}`;
              const html = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Application Accepted</title>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .status-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { background: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>🎉 Congratulations!</h1>
                    <p>APCOER Alumni Portal</p>
                  </div>
                  <div class="content">
                    <h2>Dear ${userName},</h2>
                    <p>We are delighted to inform you that your application for the position of <strong>${opportunityTitle}</strong> at <strong>${company}</strong> has been <strong>accepted</strong>!</p>
                    
                    <div class="status-box">
                      <h3>🎉 Application Status: Accepted</h3>
                      <p>Congratulations! The hiring team has selected your application for the next steps. They will contact you soon with further details about the interview process.</p>
                    </div>
                    
                    <p>This is a great achievement! We wish you the best of luck in the next stages of the recruitment process.</p>
                    
                    <p>Best regards,<br>APCOER Alumni Team</p>
                  </div>
                  <div class="footer">
                    <p>&copy; 2025 APCOER Alumni Portal. All rights reserved.</p>
                  </div>
                </body>
                </html>
              `;
              
              await sendCustomEmail(userEmail, subject, html);
              console.log(`📧 Acceptance email sent to: ${userEmail}`);
              
            } else if (status === 'rejected') {
              const subject = `📄 Update on Your Application - ${opportunityTitle}`;
              const html = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Application Update</title>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .status-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { background: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>📄 Application Update</h1>
                    <p>APCOER Alumni Portal</p>
                  </div>
                  <div class="content">
                    <h2>Dear ${userName},</h2>
                    <p>Thank you for your interest in the position of <strong>${opportunityTitle}</strong> at <strong>${company}</strong>.</p>
                    
                    <div class="status-box">
                      <h3>📄 Application Status: Not Selected</h3>
                      <p>After careful consideration, we regret to inform you that your application was not selected for this position at this time.</p>
                    </div>
                    
                    <p>Please don't be discouraged. The job market is competitive, and we encourage you to continue applying for other opportunities that match your skills and experience.</p>
                    
                    <p>We wish you the very best in your job search and future career endeavors.</p>
                    
                    <p>Best regards,<br>APCOER Alumni Team</p>
                  </div>
                  <div class="footer">
                    <p>&copy; 2025 APCOER Alumni Portal. All rights reserved.</p>
                  </div>
                </body>
                </html>
              `;
              
              await sendCustomEmail(userEmail, subject, html);
              console.log(`📧 Rejection email sent to: ${userEmail}`);
            }
          }
        }
      } catch (emailError) {
        console.error('❌ Error sending email notification:', emailError);
        // Don't fail the request if email fails
      }

      res.json({
        success: true,
        data: application,
        message: 'Application status updated successfully'
      });

    } catch (error) {
      console.error('❌ Error updating application status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status'
      });
    }
  }

  // Get application statistics
  static async getApplicationStats(req, res) {
    try {
      const stats = await Application.getApplicationStats();

      res.json({
        success: true,
        data: stats,
        message: 'Application statistics retrieved successfully'
      });

    } catch (error) {
      console.error('❌ Error fetching application stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application statistics'
      });
    }
  }
}

export default ApplicationController;
