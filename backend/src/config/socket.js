import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : ["http://localhost:5173", "http://localhost:5174"];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // Add polling as fallback
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e8, // 100 MB
    allowEIO3: true, // Support older clients
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    // Add connection stability options
    connectTimeout: 45000,
    rememberUpgrade: true,
    forceNew: false,
    // Namespace handling
    path: '/socket.io',
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ✅ AUTO AUTH FROM HANDSHAKE (BEST PRACTICE)
    const { userId, role } = socket.handshake.auth || {};

    // Prevent duplicate connections for same user
    if (userId) {
      // Leave any existing rooms for this user
      socket.leave(userId);
      // Join fresh room
      socket.join(userId);
      console.log(`👤 Joined user room: ${userId}`);
      
      // Store user info on socket for reference
      socket.userId = userId;
      socket.userRole = role;
    }

    if (role === "admin") {
      socket.join("admin_room");
      console.log(`👨‍💼 Joined admin room`);
    }

    if (role === "coordinator" && userId) {
      const roomName = `coordinator_${userId}`;
      socket.join(roomName);
      console.log(`📘 Joined coordinator room: ${roomName}`);
    }

    // Handle socket disconnection properly
    socket.on("disconnecting", (reason) => {
      console.log(`🔄 Socket ${socket.id} is disconnecting...`);
      // Clean up rooms before disconnect
      if (socket.userId) {
        socket.leave(socket.userId);
      }
      if (socket.userRole === "admin") {
        socket.leave("admin_room");
      }
      if (socket.userRole === "coordinator" && socket.userId) {
        socket.leave(`coordinator_${socket.userId}`);
      }
    });

    // ✅ OPTIONAL: manual auth (fallback)
    socket.on("authenticate", (userData) => {
      const { userId, role } = userData;

      if (userId) {
        socket.join(userId);
        console.log(`👤 (Manual) Joined user room: ${userId}`);
      }

      if (role === "admin") {
        socket.join("admin_room");
      }

      if (role === "coordinator") {
        socket.join(`coordinator_${userId}`);
      }
    });

    // ✅ MESSAGE HANDLING
    socket.on("send-message", (data) => {
      const { senderId, senderName, senderEmail, senderRole, senderDepartment, receiverId, message, timestamp } = data;

      console.log(`📨 ${senderId} → ${receiverId}: ${message}`);

      io.to(receiverId).emit("new-message", {
        senderId,
        senderName,
        senderEmail,
        senderRole,
        senderDepartment,
        receiverId,
        message,
        timestamp,
      });
    });

    // ✅ CLEAR UNREAD COUNT HANDLING
    socket.on("clear-unread-count", async (data) => {
      const { userId, contactId } = data;
      console.log(`📊 Clearing unread count for user ${userId}, contact ${contactId}`);

      try {
        // Import pool for database operations
        const { pool } = await import('../config/database.js');
        
        // Mark messages as read in database
        const markAsReadQuery = `
          UPDATE messages 
          SET is_read = true 
          WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false
        `;
        await pool.query(markAsReadQuery, [userId, contactId]);

        // Emit count update to user
        io.to(userId).emit('message-count-update', {
          senderId: contactId,
          unreadCount: 0
        });

        console.log(`✅ Cleared unread count for ${userId} from ${contactId}`);
      } catch (error) {
        console.error('❌ Error clearing unread count:', error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} - Reason: ${reason}`);
      
      // Log additional info for debugging
      if (reason === 'client namespace disconnect') {
        console.log(`📝 Client manually disconnected from namespace`);
      } else if (reason === 'ping timeout') {
        console.log(`📝 Ping timeout - client didn't respond in time`);
      } else if (reason === 'transport close') {
        console.log(`📝 Transport connection closed`);
      }
    });

    socket.on("error", (error) => {
      console.error(`🔌 Socket error for ${socket.id}:`, error.message);
    });

    socket.on("connect_error", (error) => {
      console.error(`🔌 Connect error for ${socket.id}:`, error.message);
    });

    // Handle reconnection attempts
    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Socket ${socket.id} reconnection attempt: ${attemptNumber}`);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Socket ${socket.id} reconnected after ${attemptNumber} attempts`);
    });

    socket.on("reconnect_failed", () => {
      console.log(`❌ Socket ${socket.id} failed to reconnect after all attempts`);
    });
  });

  console.log("🚀 Socket.IO initialized");
  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

// ✅ GENERAL NOTIFICATION
export const emitNotification = (room, data) => {
  if (!io) return;
  io.to(room).emit("new_notification", data);
  console.log(`📢 Notification → ${room}`);
};

// ✅ COORDINATOR NOTIFICATION
export const emitNotificationToCoordinator = (coordinatorId, data) => {
  const room = `coordinator_${coordinatorId}`;
  io.to(room).emit("new_notification", data);
  console.log(`📢 Coordinator notification → ${room}`);
};

// ✅ ADMIN NOTIFICATION
export const emitNotificationToAdmins = (data) => {
  io.to("admin_room").emit("new_notification", data);
  console.log(`📢 Admin notification`);
};