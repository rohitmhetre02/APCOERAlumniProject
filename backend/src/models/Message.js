import { pool } from '../config/database.js';

class Message {
  static async create(messageData) {
    const { sender_id, receiver_id, message } = messageData;
    
    try {
      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, message, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         RETURNING *`,
        [sender_id, receiver_id, message]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async getConversation(userId1, userId2, limit = 50, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT m.*, 
                u1.first_name as sender_first_name, 
                u1.last_name as sender_last_name,
                u2.first_name as receiver_first_name,
                u2.last_name as receiver_last_name
         FROM messages m
         LEFT JOIN users u1 ON m.sender_id = u1.id
         LEFT JOIN users u2 ON m.receiver_id = u2.id
         WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
            OR (m.sender_id = $2 AND m.receiver_id = $1)
         ORDER BY m.created_at ASC
         LIMIT $3 OFFSET $4`,
        [userId1, userId2, limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  static async getUserConversations(userId) {
    try {
      const result = await pool.query(
        `SELECT DISTINCT ON (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
                LEAST(sender_id, receiver_id) as user1_id,
                GREATEST(sender_id, receiver_id) as user2_id,
                CASE 
                  WHEN sender_id = $1 THEN receiver_id 
                  ELSE sender_id 
                END as participant_id,
                u.first_name,
                u.last_name,
                u.role,
                u.department,
                u.passout_year,
                m.message as last_message,
                m.created_at as last_message_time,
                (SELECT COUNT(*) FROM messages 
                 WHERE receiver_id = $1 AND sender_id = CASE 
                   WHEN sender_id = $1 THEN receiver_id 
                   ELSE sender_id 
                 END AND is_read = false) as unread_count
         FROM messages m
         LEFT JOIN users u ON CASE 
           WHEN m.sender_id = $1 THEN m.receiver_id 
           ELSE m.sender_id 
         END = u.id
         WHERE (m.sender_id = $1 OR m.receiver_id = $1)
         ORDER BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), m.created_at DESC`,
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  static async markAsRead(senderId, receiverId) {
    try {
      const result = await pool.query(
        `UPDATE messages 
         SET is_read = true, updated_at = NOW()
         WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
         RETURNING *`,
        [senderId, receiverId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  static async getAvailableUsersForAlumni(alumniId) {
    try {
      // Get alumni's department
      const alumniResult = await pool.query(
        'SELECT department FROM users WHERE id = $1 AND role = $2',
        [alumniId, 'alumni']
      );
      
      if (alumniResult.rows.length === 0) {
        return [];
      }
      
      const alumniDepartment = alumniResult.rows[0].department;
      
      // Get admin and coordinators (same department for coordinators)
      const result = await pool.query(
        `SELECT id, first_name, last_name, role, department, passout_year
         FROM users 
         WHERE (role = 'admin' OR (role = 'coordinator' AND department = $1))
         AND id != $2
         AND is_approved = true
         ORDER BY role DESC, first_name ASC`,
        [alumniDepartment, alumniId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting available users for alumni:', error);
      throw error;
    }
  }

  static async getAvailableUsersForAdmin(adminId) {
    try {
      const result = await pool.query(
        `SELECT id, first_name, last_name, role, department, passout_year
         FROM users 
         WHERE role IN ('coordinator', 'alumni')
         AND id != $1
         AND is_approved = true
         ORDER BY role DESC, first_name ASC`,
        [adminId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting available users for admin:', error);
      throw error;
    }
  }

  static async getAvailableUsersForCoordinator(coordinatorId) {
    try {
      // Get coordinator's department
      const coordinatorResult = await pool.query(
        'SELECT department FROM users WHERE id = $1 AND role = $2',
        [coordinatorId, 'coordinator']
      );
      
      if (coordinatorResult.rows.length === 0) {
        return [];
      }
      
      const coordinatorDepartment = coordinatorResult.rows[0].department;
      
      // Get admin and same department alumni
      const result = await pool.query(
        `SELECT id, first_name, last_name, role, department, passout_year
         FROM users 
         WHERE (role = 'admin' OR (role = 'alumni' AND department = $1))
         AND id != $2
         AND is_approved = true
         ORDER BY role DESC, first_name ASC`,
        [coordinatorDepartment, coordinatorId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting available users for coordinator:', error);
      throw error;
    }
  }
}

export default Message;
