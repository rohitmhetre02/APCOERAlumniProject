import { io } from "socket.io-client";

let socket;

export const connectSocket = (user) => {
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
    transports: ["websocket", "polling"], // Add polling as fallback
    withCredentials: true,
    auth: {
      userId: user.id,
      role: user.role,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: false, // Don't force new connection to avoid disconnects
    rememberUpgrade: true, // Remember successful upgrades
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
    
    // Log additional info for debugging
    if (reason === 'io server disconnect') {
      console.log("📝 Server disconnected, will attempt to reconnect");
    } else if (reason === 'ping timeout') {
      console.log("📝 Ping timeout occurred");
    }
  });

  socket.on("connect_error", (error) => {
    console.error("🔌 Socket connection error:", error.message);
  });

  // Handle reconnection attempts
  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`🔄 Reconnection attempt: ${attemptNumber}`);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`✅ Reconnected after ${attemptNumber} attempts`);
  });

  socket.on("reconnect_failed", () => {
    console.log("❌ Failed to reconnect after all attempts");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
