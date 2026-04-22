import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
