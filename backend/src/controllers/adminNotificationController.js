import { 
  createContentApprovalNotification,
  createPostApprovalNotification,
  createPostRejectionNotification,
  createCoordinatorPostNotification
} from './notificationController.js';
import { createNotificationWithRealTime } from './services/notificationSocketService.js';

// @desc    Example: Admin approves event/opportunity
// @route   PUT /api/admin/approve/:type/:id
// @access  Admin
export const approveContent = async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'event' or 'opportunity'
    const { alumni_id } = req.body;
    
    // Update content status in database (your existing logic)
    // ... your approval logic here ...
    
    // Create notification for alumni
    const postData = {
      id: id,
      department: req.body.department || null,
      title: req.body.title || 'Content'
    };
    
    const notification = await createPostApprovalNotification(postData, alumni_id);
    
    // Emit real-time notification
    await createNotificationWithRealTime({
      receiver_id: alumni_id,
      sender_id: null,
      role_target: 'alumni',
      department: postData.department,
      message: "Your post has been approved.",
      type: 'approval',
      reference_id: id,
      emitRealTime: true
    });
    
    res.status(200).json({
      status: 'success',
      message: `${type} approved successfully`,
      data: {
        notification: notification
      }
    });
  } catch (error) {
    console.error('Error approving content:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Example: Admin rejects event/opportunity
// @route   PUT /api/admin/reject/:type/:id
// @access  Admin
export const rejectContent = async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'event' or 'opportunity'
    const { alumni_id, reason } = req.body;
    
    // Update content status in database (your existing logic)
    // ... your rejection logic here ...
    
    // Create notification for alumni
    const postData = {
      id: id,
      department: req.body.department || null,
      title: req.body.title || 'Content'
    };
    
    const notification = await createPostRejectionNotification(postData, alumni_id);
    
    // Emit real-time notification
    await createNotificationWithRealTime({
      receiver_id: alumni_id,
      sender_id: null,
      role_target: 'alumni',
      department: postData.department,
      message: reason ? `Your post has been rejected: ${reason}` : "Your post has been rejected.",
      type: 'rejection',
      reference_id: id,
      emitRealTime: true
    });
    
    res.status(200).json({
      status: 'success',
      message: `${type} rejected successfully`,
      data: {
        notification: notification
      }
    });
  } catch (error) {
    console.error('Error rejecting content:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Example: Alumni creates event/opportunity
// @route   POST /api/alumni/:type
// @access  Alumni
export const createContent = async (req, res) => {
  try {
    const { type } = req.params; // type: 'event' or 'opportunity'
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Create content in database (your existing logic)
    // ... your content creation logic here ...
    
    const contentData = {
      id: 'new-content-id', // This would come from your database insert
      title: req.body.title,
      created_by: userId,
      department: req.body.department || req.user.department
    };
    
    // CASE 2: Alumni creates post -> Notify admin
    if (userRole === 'alumni') {
      await createContentApprovalNotification(contentData, type);
    }
    
    // CASE 4: Coordinator creates post -> Notify admin
    else if (userRole === 'coordinator') {
      await createCoordinatorPostNotification(contentData, userId);
    }
    
    res.status(201).json({
      status: 'success',
      message: `${type} created successfully. Pending approval.`,
      data: {
        content: contentData
      }
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
