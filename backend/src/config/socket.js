import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    
    // Join coordinator to their personal room when they authenticate
    socket.on('authenticate_coordinator', (coordinatorId) => {
      console.log(`🔐 Coordinator ${coordinatorId} authenticated, joining room`);
      const roomName = `coordinator_${coordinatorId}`;
      socket.join(roomName);
      console.log(`📱 Socket ${socket.id} joined room: ${roomName}`);
      console.log(`📱 Total rooms for socket:`, socket.rooms);
      console.log(`📱 Total clients in ${roomName}:`, io.sockets.adapter.rooms.get(roomName)?.size || 0);
    });
    
    // Join admin to admin room
    socket.on('authenticate_admin', () => {
      console.log(`🔐 Admin authenticated, joining admin room`);
      socket.join('admin_room');
      console.log(`📱 Socket ${socket.id} joined admin room`);
    });
    
    socket.on('disconnect', () => {
      console.log(`� Socket disconnected: ${socket.id}`);
    });
  });

  console.log('🚀 Socket.IO server initialized');
  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

// Emit notification to specific coordinator
export const emitNotificationToCoordinator = (coordinatorId, notificationData) => {
  const socketIO = getSocketIO();
  const roomName = `coordinator_${coordinatorId}`;
  
  console.log(`📡 Emitting to room: ${roomName}`);
  console.log(`📡 Room exists check:`, socketIO.sockets.adapter.rooms.has(roomName));
  console.log(`📡 Clients in room:`, socketIO.sockets.adapter.rooms.get(roomName)?.size || 0);
  
  socketIO.to(roomName).emit('new_notification', notificationData);
  console.log(`📢 Notification emitted to coordinator ${coordinatorId}:`, notificationData.message);
};

// Emit notification to all admins
export const emitNotificationToAdmins = (notificationData) => {
  const socketIO = getSocketIO();
  socketIO.to('admin_room').emit('new_notification', notificationData);
  console.log('📢 Notification emitted to admins:', notificationData.message);
};

// Legacy function for backward compatibility
export const emitNotification = (notificationData) => {
  const socketIO = getSocketIO();
  socketIO.emit('new_notification', notificationData);
  console.log('📢 Notification emitted to all:', notificationData.message);
};
