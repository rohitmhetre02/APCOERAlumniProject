import { pool } from '../config/database.js';
import { sendCustomEmail } from '../services/emailService.js';

// @desc    Get all applications for a specific opportunity
// @route   GET /api/opportunities/:opportunityId/applications
// @access  Admin, Coordinator
export const getOpportunityApplications = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    
    console.log(`🔧 getOpportunityApplications called with opportunityId: ${opportunityId}`);
    console.log(`🔧 User making request:`, { id: req.user?.id, email: req.user?.email, role: req.user?.role });

    // Verify opportunity exists
    const opportunityQuery = `
      SELECT id, title, company, type, location, salary_range, deadline, description, skills
      FROM opportunities 
      WHERE id = $1
    `;
    
    const opportunityResult = await pool.query(opportunityQuery, [opportunityId]);
    
    if (opportunityResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Get all applications for this opportunity
    const applicationsQuery = `
      SELECT 
        a.id,
        a.user_id,
        a.opportunity_id,
        a.status,
        a.applied_date,
        a.updated_at,
        a.proposal,
        u.first_name,
        u.last_name,
        u.email,
        u.department,
        u.passout_year,
        u.contact_number
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.opportunity_id = $1
      ORDER BY a.applied_date DESC
    `;
    
    const applicationsResult = await pool.query(applicationsQuery, [opportunityId]);
    
    console.log(`📋 Found ${applicationsResult.rows.length} applications for opportunity ${opportunityId}`);
    if (applicationsResult.rows.length > 0) {
      console.log(`📋 First application data:`, applicationsResult.rows[0]);
      console.log(`📋 First application keys:`, Object.keys(applicationsResult.rows[0]));
      console.log(`📋 User details:`, {
        first_name: applicationsResult.rows[0].first_name,
        last_name: applicationsResult.rows[0].last_name,
        email: applicationsResult.rows[0].email,
        department: applicationsResult.rows[0].department,
        passout_year: applicationsResult.rows[0].passout_year,
        contact_number: applicationsResult.rows[0].contact_number,
        proposal: applicationsResult.rows[0].proposal
      });
    }

    const responseData = {
      success: true,
      data: applicationsResult.rows,
      opportunity: opportunityResult.rows[0]
    };
    
    console.log(`🔧 Sending response:`, {
      success: responseData.success,
      applicationsCount: responseData.data?.length,
      opportunityId: responseData.opportunity?.id,
      opportunityTitle: responseData.opportunity?.title
    });

    res.json(responseData);
  } catch (error) {
    console.error('❌ Error fetching opportunity applications:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/opportunities/applications/:applicationId/status
// @access  Admin, Coordinator
export const updateApplicationStatus = async (req, res) => {
  try {
    console.log('🔧 updateApplicationStatus called');
    console.log('🔧 Request params:', req.params);
    console.log('🔧 Request body:', req.body);
    console.log('🔧 User making request:', req.user);
    
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status - match database schema
    const validStatuses = ['pending', 'under_review', 'shortlisted', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, under_review, shortlisted, accepted, rejected'
      });
    }

    // Get application details with user and opportunity info for email
    const getApplicationQuery = `
      SELECT 
        a.id as application_id,
        a.status as old_status,
        a.user_id,
        a.opportunity_id,
        u.first_name,
        u.last_name,
        u.email,
        o.title as opportunity_title,
        o.company,
        o.description as opportunity_description
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.id = $1
    `;
    
    console.log('🔧 Executing application details query:', getApplicationQuery);
    console.log('🔧 With applicationId:', applicationId);
    
    const applicationDetails = await pool.query(getApplicationQuery, [applicationId]);
    console.log('🔧 Application details query result:', applicationDetails.rows.length, 'rows found');
    
    if (applicationDetails.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const appDetails = applicationDetails.rows[0];

    // Update application status
    const updateQuery = `
      UPDATE applications 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    console.log('🔧 Executing update query:', updateQuery);
    console.log('🔧 With parameters:', { status, applicationId });
    
    const result = await pool.query(updateQuery, [status, applicationId]);
    console.log('🔧 Update query result:', result.rows.length, 'rows affected');
    
    if (result.rows.length === 0) {
      console.error('❌ No rows were updated - application might not exist');
      return res.status(404).json({
        success: false,
        message: 'Application not found or no changes made'
      });
    }
    
    const updatedApplication = result.rows[0];
    console.log(`📋 Application ${applicationId} status updated to: ${status}`);

    // Send email notification based on status change
    try {
      const userName = `${appDetails.first_name} ${appDetails.last_name}`;
      const userEmail = appDetails.email;
      const opportunityTitle = appDetails.opportunity_title;
      const company = appDetails.company;

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
    } catch (emailError) {
      console.error('❌ Error sending email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: updatedApplication
    });
  } catch (error) {
    console.error('❌ Error updating application status:', error.message);
    console.error('❌ Full error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      code: error.code,
      severity: error.severity,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      file: error.file
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message,
      details: {
        name: error.name,
        code: error.code,
        severity: error.severity
      }
    });
  }
};

// @desc    Download application resume
// @route   GET /api/opportunities/applications/:applicationId/resume
// @access  Admin, Coordinator
export const downloadResume = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Get application with resume URL
    const query = `
      SELECT first_name, last_name, resume_url
      FROM applications 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [applicationId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const application = result.rows[0];
    
    if (!application.resume_url) {
      return res.status(404).json({
        success: false,
        message: 'No resume found for this application'
      });
    }

    console.log(`📄 Downloading resume for application ${applicationId}`);

    // If resume is stored as a URL, redirect to it
    if (application.resume_url.startsWith('http')) {
      return res.redirect(application.resume_url);
    }

    // If resume is stored as file path or base64, handle accordingly
    // This would depend on how you're storing resumes
    res.json({
      success: true,
      message: 'Resume download URL',
      resumeUrl: application.resume_url
    });
  } catch (error) {
    console.error('❌ Error downloading resume:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to download resume',
      error: error.message
    });
  }
};
