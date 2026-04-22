import Opportunity from '../models/Opportunity.js';

// Get opportunity by ID
export const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const opportunity = await Opportunity.findById(id);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    res.json({
      success: true,
      data: opportunity,
      message: 'Opportunity retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching opportunity:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunity',
      error: error.message
    });
  }
};

// Get all opportunities (for alumni frontend)
export const getAllOpportunities = async (req, res) => {
  try {
    // Check if this is the approved route
    const isApprovedRoute = req.originalUrl.includes('/approved');
    const opportunities = await Opportunity.getAll(isApprovedRoute ? 'approved' : 'all');

    res.json({
      success: true,
      data: opportunities,
      message: 'Opportunities retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching opportunities:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunities',
      error: error.message
    });
  }
};

// Get pending opportunities (for admin approval)
export const getPendingOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.getAll('pending');

    res.json({
      success: true,
      data: opportunities,
      message: 'Pending opportunities retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching pending opportunities:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending opportunities',
      error: error.message
    });
  }
};

// Approve opportunity
export const approveOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔧 Starting opportunity approval for ID: ${id}`);
    
    const opportunity = await Opportunity.updateStatus(id, 'approved');
    
    if (!opportunity) {
      console.log(`❌ Opportunity not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    console.log(`✅ Opportunity updated successfully: ${opportunity.title}`);
    console.log(`🔧 Author info: ${opportunity.author_name} (${opportunity.author_email})`);

    // Send approval email to opportunity creator
    try {
      console.log(`📧 Sending approval email to creator: ${opportunity.author_email}`);
      console.log(`📧 Author email exists: ${!!opportunity.author_email}`);
      console.log(`📧 Author name: ${opportunity.author_name}`);
      
      const { sendEmail } = await import('../services/emailService.js');
      const { getOpportunityApprovalTemplate } = await import('../utils/emailTemplates.js');
      
      console.log(`📧 Creating email template...`);
      const emailTemplate = getOpportunityApprovalTemplate(opportunity);
      console.log(`📧 Email template created. Subject: ${emailTemplate.subject}`);
      console.log(`📧 HTML length: ${emailTemplate.html.length}`);
      
      console.log(`📧 About to send email...`);
      const emailResult = await sendEmail(opportunity.author_email, emailTemplate.subject, emailTemplate.html);
      console.log(`✅ Approval email sent to opportunity creator: ${opportunity.author_email}`);
      console.log(`📧 Email result:`, emailResult);
    } catch (emailError) {
      console.error('❌ Failed to send approval email to creator:', emailError.message);
      console.error('❌ Full email error:', emailError);
    }

    // Send notification email to all alumni about new opportunity
    try {
      console.log(`📧 Starting bulk email to all alumni...`);
      const { sendBulkEmail } = await import('../services/emailService.js');
      const { getAlumniOpportunityNotificationTemplate } = await import('../utils/emailTemplates.js');
      const { pool } = await import('../config/database.js');
      
      // Get all approved alumni emails
      const alumniQuery = `
        SELECT email, first_name, last_name 
        FROM users 
        WHERE role = 'alumni' AND status = 'active'
      `;
      console.log(`📧 Executing alumni query...`);
      const alumniResult = await pool.query(alumniQuery);
      
      if (alumniResult.rows.length > 0) {
        console.log(`👥 Found ${alumniResult.rows.length} alumni to notify`);
        console.log(`📧 Alumni emails:`, alumniResult.rows.map(a => a.email));
        
        console.log(`📧 Creating alumni email template...`);
        const emailTemplate = getAlumniOpportunityNotificationTemplate(opportunity);
        console.log(`📧 Alumni template subject: ${emailTemplate.subject}`);
        
        const alumniEmails = alumniResult.rows.map(alumni => alumni.email);
        console.log(`📧 About to send bulk emails to ${alumniEmails.length} alumni...`);
        
        const bulkResult = await sendBulkEmail(alumniEmails, emailTemplate.subject, emailTemplate.html);
        console.log(`✅ Bulk notification email completed: ${bulkResult.totalSent}/${bulkResult.totalSent + bulkResult.totalFailed} sent successfully`);
        console.log(`📧 Bulk result details:`, bulkResult);
      } else {
        console.log(`ℹ️ No approved alumni found to notify`);
      }
    } catch (bulkEmailError) {
      console.error('❌ Failed to send bulk alumni notification email:', bulkEmailError.message);
      console.error('❌ Full bulk email error:', bulkEmailError);
    }

    // Send notification to opportunity creator
    try {
      const { createNotification } = await import('./notificationController.js');
      await createNotification({
        user_id: opportunity.created_by,
        message: `Your opportunity "${opportunity.title}" has been approved and is now live!`,
        type: 'opportunity_approved',
        department: opportunity.department
      });
      console.log(`✅ Approval notification sent to opportunity creator for: ${opportunity.title}`);
    } catch (notificationError) {
      console.error('❌ Failed to send approval notification:', notificationError.message);
    }

    const responseMessage = `Opportunity "${opportunity.title}" approved successfully! Approval email sent to creator and notification sent to all alumni.`;
    console.log(`🎉 Opportunity approval completed successfully!`);
    
    res.json({
      success: true,
      message: responseMessage,
      data: opportunity
    });
  } catch (error) {
    console.error('❌ Error approving opportunity:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to approve opportunity',
      error: error.message
    });
  }
};

// Reject opportunity
export const rejectOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    
    const opportunity = await Opportunity.updateStatus(id, 'rejected', rejection_reason);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Send rejection email to opportunity creator only
    try {
      const { sendEmail } = await import('../services/emailService.js');
      const { getOpportunityRejectionTemplate } = await import('../utils/emailTemplates.js');
      
      const emailTemplate = getOpportunityRejectionTemplate(opportunity, rejection_reason);
      await sendEmail(opportunity.author_email, emailTemplate.subject, emailTemplate.html);
      console.log(`📧 Rejection email sent to opportunity creator: ${opportunity.author_email}`);
    } catch (emailError) {
      console.error('❌ Failed to send rejection email to creator:', emailError.message);
    }

    // Send notification to opportunity creator
    try {
      const { createNotification } = await import('./notificationController.js');
      await createNotification({
        user_id: opportunity.created_by,
        message: `Your opportunity "${opportunity.title}" has been reviewed and requires changes.`,
        type: 'opportunity_rejected',
        department: opportunity.department
      });
      console.log(`📢 Rejection notification sent to opportunity creator for: ${opportunity.title}`);
    } catch (notificationError) {
      console.error('❌ Failed to send rejection notification:', notificationError.message);
    }

    res.json({
      success: true,
      message: 'Opportunity rejected successfully',
      data: opportunity
    });
  } catch (error) {
    console.error('❌ Error rejecting opportunity:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reject opportunity',
      error: error.message
    });
  }
};

// Create new opportunity
export const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      company,
      type,
      location,
      salary_range,
      experience_range,
      deadline,
      skills,
      description
    } = req.body;

    const opportunityData = {
      title,
      company,
      type,
      location,
      salary_range,
      experience_range,
      deadline,
      skills,
      description,
      author_id: req.user.id,
      author_role: req.user.role
    };

    const opportunity = await Opportunity.create(opportunityData);

    // If admin created opportunity, send email to all alumni
    if (req.user.role === 'admin') {
      try {
        const { sendAdminOpportunityNotificationEmails } = await import('./emailController.js');
        await sendAdminOpportunityNotificationEmails(opportunity);
        console.log(`📧 Opportunity notification emails sent to alumni for: ${opportunity.title}`);
      } catch (emailError) {
        console.error('❌ Failed to send opportunity notification emails:', emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      data: opportunity,
      message: req.user.role === 'admin' 
        ? 'Opportunity created successfully! Notification emails have been sent to all alumni.'
        : 'Opportunity created successfully! It is now pending admin approval.'
    });
  } catch (error) {
    console.error('❌ Error creating opportunity:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create opportunity',
      error: error.message
    });
  }
};

// Update opportunity
export const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get the opportunity first to check ownership
    const opportunity = await Opportunity.findById(id);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if user is admin or the creator
    if (userRole !== 'admin' && opportunity.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own opportunities.'
      });
    }

    const {
      title,
      company,
      type,
      location,
      salary_range,
      experience_range,
      deadline,
      skills,
      description
    } = req.body;

    const updateData = {
      title,
      company,
      type,
      location,
      salary_range,
      experience_range,
      deadline,
      skills,
      description
    };

    const updatedOpportunity = await Opportunity.update(id, updateData);

    res.json({
      success: true,
      data: updatedOpportunity,
      message: 'Opportunity updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating opportunity:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update opportunity',
      error: error.message
    });
  }
};

// Apply for opportunity (for alumni)
export const applyForOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if opportunity exists and is active
    const opportunity = await Opportunity.findById(id);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if deadline has passed
    if (opportunity.deadline && new Date(opportunity.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user has already applied (this would require an applications table)
    // For now, just increment the application count
    await Opportunity.incrementApplications(id);

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('❌ Error applying for opportunity:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};


// Delete opportunity
export const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get the opportunity first to check ownership
    const opportunity = await Opportunity.findById(id);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if user is admin or the creator
    if (userRole !== 'admin' && opportunity.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own opportunities.'
      });
    }

    await Opportunity.delete(id);

    res.json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting opportunity:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete opportunity',
      error: error.message
    });
  }
};

// Get applications for a specific opportunity
export const getOpportunityApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // First check if the opportunity exists and belongs to the current user
    const opportunity = await Opportunity.findById(id);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if the current user is the creator of this opportunity
    if (opportunity.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view applications for your own opportunities'
      });
    }

    // Get applications for this opportunity
    const applications = await Opportunity.getApplications(id);

    res.json({
      success: true,
      data: applications,
      message: 'Applications retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching applications:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Accept an application
export const acceptApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;
    
    // Accept the application and verify ownership
    const result = await Opportunity.acceptApplication(applicationId, userId);

    res.json({
      success: true,
      message: 'Application accepted successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error accepting application:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to accept application',
      error: error.message
    });
  }
};

// Reject an application
export const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { rejection_reason } = req.body;
    const userId = req.user.id;
    
    // Reject the application and verify ownership
    const result = await Opportunity.rejectApplication(applicationId, userId, rejection_reason);

    res.json({
      success: true,
      message: 'Application rejected successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error rejecting application:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reject application',
      error: error.message
    });
  }
};

// Get current user's opportunities (for alumni)
export const getMyOpportunities = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const opportunities = await Opportunity.getByAuthor(userId);

    res.json({
      success: true,
      data: opportunities,
      message: 'Your opportunities retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching your opportunities:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your opportunities',
      error: error.message
    });
  }
};
