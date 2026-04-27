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
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ✅ AUTO AUTH FROM HANDSHAKE (BEST PRACTICE)
    const { userId, role } = socket.handshake.auth || {};

    if (userId) {
      socket.join(userId);
      console.log(`👤 Joined user room: ${userId}`);
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

    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} - Reason: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`🔌 Socket error for ${socket.id}:`, error);
    });

    socket.on("connect_error", (error) => {
      console.error(`🔌 Connect error for ${socket.id}:`, error);
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