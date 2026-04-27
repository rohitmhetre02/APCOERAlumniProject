import { io } from "socket.io-client";

let socket;

export const connectSocket = (user) => {
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  socket = io("http://localhost:5000", {
    transports: ["websocket", "polling"], // Add polling as fallback
    withCredentials: true,
    auth: {
      userId: user.id,
      role: user.role,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("🔌 Socket connection error:", error);
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
