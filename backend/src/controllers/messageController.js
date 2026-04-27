import { pool } from '../config/database.js';

// @desc    Get alumni list for admin/coordinator messaging
// @route   GET /api/messages/alumni-list
// @access  Private (Admin/Coordinator)
export const getAlumniList = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userDepartment = req.user.department;

    // Check database connection first
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return demo data if database is not available
      const demoAlumni = [
        {
          id: 'demo-alumni-1',
          name: 'John Doe',
          email: 'john.doe@alumni.apcoer.edu',
          department: 'Computer Engineering'
        },
        {
          id: 'demo-alumni-2',
          name: 'Jane Smith',
          email: 'jane.smith@alumni.apcoer.edu',
          department: 'Computer Engineering'
        },
        {
          id: 'demo-alumni-3',
          name: 'Mike Johnson',
          email: 'mike.johnson@alumni.apcoer.edu',
          department: 'Information Technology'
        }
      ];
      
      return res.status(200).json({
        status: 'success',
        message: 'Demo alumni list retrieved (database unavailable)',
        data: demoAlumni
      });
    }

    // Simple query without graduation_year column
    let query = `
      SELECT id, first_name, last_name, email, department
      FROM users 
      WHERE role = 'alumni' 
        AND (is_approved = true OR is_approved IS NULL)
    `;

    // If coordinator, only show alumni from same department
    const params = [];
    if (userRole === 'coordinator') {
      query += ` AND department = $1`;
      params.push(userDepartment);
    }

    query += ` ORDER BY first_name, last_name`;

    const result = await pool.query(query, params);

    const alumniList = result.rows.map(alumni => ({
      id: alumni.id,
      name: `${alumni.first_name} ${alumni.last_name}`,
      email: alumni.email,
      department: alumni.department
    }));

    res.status(200).json({
      status: 'success',
      message: 'Alumni list retrieved successfully',
      data: alumniList
    });
  } catch (error) {
    console.error('Error fetching alumni list:', error);
    
    // Return demo data on any error
    const demoAlumni = [
      {
        id: 'demo-alumni-1',
        name: 'John Doe',
        email: 'john.doe@alumni.apcoer.edu',
        department: 'Computer Engineering'
      },
      {
        id: 'demo-alumni-2',
        name: 'Jane Smith',
        email: 'jane.smith@alumni.apcoer.edu',
        department: 'Computer Engineering'
      },
      {
        id: 'demo-alumni-3',
        name: 'Mike Johnson',
        email: 'mike.johnson@alumni.apcoer.edu',
        department: 'Information Technology'
      }
    ];
    
    res.status(200).json({
      status: 'success',
      message: 'Demo alumni list retrieved (error fallback)',
      data: demoAlumni
    });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check database connection first
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return empty conversations if database is not available
      return res.status(200).json({
        status: 'success',
        message: 'No conversations found (database unavailable)',
        data: []
      });
    }
    
    // Simplified query without graduation_year complications
    const query = `
      SELECT DISTINCT ON (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END
      )
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.department,
        m.message as last_message_text,
        m.created_at as last_message_time,
        m.sender_id as last_sender_id
      FROM messages m
      JOIN users u ON (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END = u.id
      )
      WHERE (m.sender_id = $1 OR m.receiver_id = $1)
      ORDER BY 
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END,
        m.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    const conversations = result.rows.map(row => ({
      user_id: row.user_id,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      role: row.role,
      department: row.department,
      last_message: {
        message: row.last_message_text,
        created_at: row.last_message_time,
        sender_id: row.last_sender_id
      }
    }));

    res.status(200).json({
      status: 'success',
      message: 'Conversations retrieved successfully',
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    // Return empty array instead of 500 error
    res.status(200).json({
      status: 'success',
      message: 'No conversations found',
      data: []
    });
  }
};

// @desc    Get unread message count for current user
// @route   GET /api/messages/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if is_read column exists
    const columnCheckQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'messages' AND column_name = 'is_read'
    `;
    
    const columnCheck = await pool.query(columnCheckQuery);
    const hasReadColumn = columnCheck.rows.length > 0;
    
    let query;
    if (hasReadColumn) {
      query = `
        SELECT COUNT(*) as unread_count
        FROM messages 
        WHERE receiver_id = $1 AND is_read = false
      `;
    } else {
      // If no is_read column, return 0 (all messages considered read)
      query = `
        SELECT 0 as unread_count
      `;
    }
    
    const result = await pool.query(query, hasReadColumn ? [userId] : []);
    const unreadCount = parseInt(result.rows[0].unread_count) || 0;

    res.status(200).json({
      status: 'success',
      message: 'Unread count retrieved successfully',
      data: unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch unread count'
    });
  }
};

// @desc    Get coordinator list for admin messaging
// @route   GET /api/messages/coordinator-list
// @access  Private (Admin)
export const getCoordinatorList = async (req, res) => {
  try {
    // Only admins can see coordinator list
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Only admins can view coordinators.'
      });
    }

    const query = `
      SELECT id, first_name, last_name, email, department
      FROM users 
      WHERE role = 'coordinator' AND is_approved = true
      ORDER BY department, first_name, last_name
    `;

    const result = await pool.query(query);

    const coordinatorList = result.rows.map(coordinator => ({
      id: coordinator.id,
      name: `${coordinator.first_name} ${coordinator.last_name}`,
      email: coordinator.email,
      department: coordinator.department
    }));

    res.status(200).json({
      status: 'success',
      message: 'Coordinator list retrieved successfully',
      data: coordinatorList
    });
  } catch (error) {
    console.error('Error fetching coordinator list:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Get contacts (Admin + Coordinator) for alumni
// @route   GET /api/messages/contacts
// @access  Private (Alumni)
export const getContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDepartment = req.user.department;

    // Check database connection first
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return demo admin and coordinator if database is not available
      const demoContacts = [
        {
          id: 'demo-admin-1',
          name: 'System Admin',
          email: 'admin@apcoer.edu',
          role: 'admin'
        },
        {
          id: 'demo-coordinator-1',
          name: 'Department Coordinator',
          email: 'coordinator@apcoer.edu',
          role: 'coordinator',
          department: userDepartment || 'Computer Engineering'
        }
      ];
      
      return res.status(200).json({
        status: 'success',
        message: 'Demo contacts retrieved (database unavailable)',
        data: demoContacts
      });
    }

    // Find admin user
    const adminQuery = `
      SELECT id, first_name, last_name, email, role
      FROM users 
      WHERE role = 'admin' AND is_approved = true
      LIMIT 1
    `;
    
    // Find coordinator for same department
    const coordinatorQuery = `
      SELECT id, first_name, last_name, email, role, department
      FROM users 
      WHERE role = 'coordinator' AND department = $1 AND is_approved = true
      LIMIT 1
    `;

    const [adminResult, coordinatorResult] = await Promise.all([
      pool.query(adminQuery),
      pool.query(coordinatorQuery, [userDepartment])
    ]);

    const contacts = [];

    // Add admin if found
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      contacts.push({
        id: admin.id,
        name: `${admin.first_name} ${admin.last_name}`,
        email: admin.email,
        role: admin.role
      });
    }

    // Add coordinator if found
    if (coordinatorResult.rows.length > 0) {
      const coordinator = coordinatorResult.rows[0];
      contacts.push({
        id: coordinator.id,
        name: `${coordinator.first_name} ${coordinator.last_name}`,
        email: coordinator.email,
        role: coordinator.role,
        department: coordinator.department
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Contacts retrieved successfully',
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Get messages between logged-in user and another user
// @route   GET /api/messages/:receiverId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user.id;

    const query = `
      SELECT m.*, 
             u_sender.first_name as sender_first_name,
             u_sender.last_name as sender_last_name,
             u_receiver.first_name as receiver_first_name,
             u_receiver.last_name as receiver_last_name
      FROM messages m
      LEFT JOIN users u_sender ON m.sender_id = u_sender.id
      LEFT JOIN users u_receiver ON m.receiver_id = u_receiver.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `;

    const result = await pool.query(query, [senderId, receiverId]);

    // Check if is_read column exists and mark messages as read
    const columnCheckQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'messages' AND column_name = 'is_read'
    `;
    
    const columnCheck = await pool.query(columnCheckQuery);
    const hasReadColumn = columnCheck.rows.length > 0;

    if (hasReadColumn) {
      // Mark messages as read (messages where current user is receiver)
      const markAsReadQuery = `
        UPDATE messages 
        SET is_read = true 
        WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false
      `;
      
      await pool.query(markAsReadQuery, [senderId, receiverId]);
    }

    res.status(200).json({
      status: 'success',
      message: 'Messages retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    const sender_id = req.user.id;

    // Validate required fields
    if (!receiver_id || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Receiver ID and message are required'
      });
    }

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(receiver_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid receiver ID'
      });
    }

    // Check if receiver exists
    const receiverQuery = `
      SELECT id, first_name, last_name, role, department
      FROM users 
      WHERE id = $1 AND is_approved = true
    `;
    
    const receiverResult = await pool.query(receiverQuery, [receiver_id]);
    if (receiverResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Receiver not found'
      });
    }

    // Role-based validation for messaging
    const senderRole = req.user.role;
    const receiver = receiverResult.rows[0];

    if (senderRole === 'alumni') {
      // Alumni can only message admin or their department coordinator
      if (receiver.role !== 'admin' && 
          !(receiver.role === 'coordinator' && receiver.department === req.user.department)) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only message admin or your department coordinator'
        });
      }
    } else if (senderRole === 'coordinator') {
      // Coordinators can only message alumni from their department
      if (receiver.role !== 'alumni' || receiver.department !== req.user.department) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only message alumni from your department'
        });
      }
    } else if (senderRole === 'admin') {
      // Admin can message anyone (alumni and coordinators)
      if (receiver.role !== 'alumni' && receiver.role !== 'coordinator') {
        return res.status(403).json({
          status: 'error',
          message: 'You can only message alumni and coordinators'
        });
      }
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized messaging role'
      });
    }

    // Insert message
    const insertQuery = `
      INSERT INTO messages (sender_id, receiver_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [sender_id, receiver_id, message]);
    const newMessage = result.rows[0];

    // Get sender and receiver names for the response
    const namesQuery = `
      SELECT 
        s.first_name as sender_first_name,
        s.last_name as sender_last_name,
        r.first_name as receiver_first_name,
        r.last_name as receiver_last_name
      FROM users s, users r
      WHERE s.id = $1 AND r.id = $2
    `;

    const namesResult = await pool.query(namesQuery, [sender_id, receiver_id]);

    const responseMessage = {
      id: newMessage.id,
      sender_id: newMessage.sender_id,
      receiver_id: newMessage.receiver_id,
      message: newMessage.message,
      created_at: newMessage.created_at,
      sender_name: `${namesResult.rows[0].sender_first_name} ${namesResult.rows[0].sender_last_name}`,
      receiver_name: `${namesResult.rows[0].receiver_first_name} ${namesResult.rows[0].receiver_last_name}`
    };

    // Emit real-time message via Socket.IO (if available)
    try {
      const { getSocketIO } = await import('../config/socket.js');
      const io = getSocketIO();
      
      // Send to receiver's room
      io.to(receiver_id).emit('new-message', {
        senderId: sender_id,
        senderName: responseMessage.sender_name,
        receiverId: receiver_id,
        message: message,
        timestamp: newMessage.created_at
      });
      
      console.log(`📢 Real-time message sent from ${sender_id} to ${receiver_id}`);
    } catch (socketError) {
      console.log('Socket.IO not available, skipping real-time emit');
    }

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: responseMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// @desc    Create messages table (migration)
// @access  Internal
export const createMessagesTable = async () => {
  try {
    // Drop existing table if it exists (for clean migration)
    await pool.query(`DROP TABLE IF EXISTS messages CASCADE`);
    
    const createTableQuery = `
      CREATE TABLE messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    console.log('✅ messages table created successfully');

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX idx_messages_sender_id ON messages(sender_id)',
      'CREATE INDEX idx_messages_receiver_id ON messages(receiver_id)',
      'CREATE INDEX idx_messages_created_at ON messages(created_at DESC)',
      'CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC)'
    ];

    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    console.log('✅ messages table indexes created successfully');

    console.log('🎉 messages table setup completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating messages table:', error.message);
    throw error;
  }
};
