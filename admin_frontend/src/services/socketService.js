import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect() {
    if (this.socket && this.socket.connected) {
      console.log('🔌 Socket already connected');
      return this.socket;
    }

    const token = localStorage.getItem('coordinator_token') || localStorage.getItem('admin_token');
    if (!token) {
      console.warn('⚠️ No coordinator or admin token found, skipping socket connection');
      return null;
    }

    try {
      return this.createConnection(token);
    } catch (error) {
      console.error('🔌 Failed to initialize socket connection:', error);
      return null;
    }
  }

  // Create socket connection
  createConnection(token) {

    // Clean up existing socket if any
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Extract base URL from API URL (remove /api if present)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const serverUrl = apiUrl.replace('/api', '') || 'http://localhost:5000';
    console.log('🔌 Connecting to socket server:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
      
      // Authenticate as coordinator if coordinator token exists
      const coordinatorToken = localStorage.getItem('coordinator_token');
      if (coordinatorToken) {
        try {
          // Decode token to get coordinator ID
          const tokenPayload = JSON.parse(atob(coordinatorToken.split('.')[1]));
          const coordinatorId = tokenPayload.id;
          
          if (coordinatorId) {
            console.log('🔐 Authenticating as coordinator:', coordinatorId);
            this.socket.emit('authenticate_coordinator', coordinatorId);
          }
        } catch (error) {
          console.error('❌ Error decoding coordinator token:', error);
        }
      }
      
      // Authenticate as admin if admin token exists
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken && !coordinatorToken) {
        console.log('🔐 Authenticating as admin');
        this.socket.emit('authenticate_admin');
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      console.error('🔌 Error details:', {
        message: error.message,
        description: error.description,
        type: error.type,
        context: error.context
      });
      
      // Try fallback to polling if websocket fails
      if (error.message.includes('Invalid namespace') || error.message.includes('transport') || error.message.includes('websocket')) {
        console.log('🔌 Trying fallback connection with polling...');
        this.socket.io.opts.transports = ['polling'];
        
        // Try reconnecting with polling
        setTimeout(() => {
          if (this.socket && !this.socket.connected) {
            this.socket.connect();
          }
        }, 2000);
      }
    });

    // Set up default listeners
    this.setupDefaultListeners();

    return this.socket;
  }

  // Setup default event listeners
  setupDefaultListeners() {
    if (!this.socket) return;

    // Listen for new notifications
    this.socket.on('new_notification', (notification) => {
      console.log('📢 New notification received:', notification);
      
      // Trigger all registered notification listeners
      const notificationListeners = this.listeners.get('new_notification') || [];
      notificationListeners.forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('❌ Error in notification listener:', error);
        }
      });

      // Show browser notification if supported
      this.showBrowserNotification(notification);
    });
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Also add to socket if it exists
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    // Also remove from socket if it exists
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit event
  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected, cannot emit event:', event);
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎓 APCOER Alumni - New Notification', {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('🎓 APCOER Alumni - New Notification', {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id
          });
        }
      });
    }
  }

  // Request notification permission
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Optional connection - won't throw errors
  connectOptional() {
    try {
      return this.connect();
    } catch (error) {
      console.warn('🔌 Socket connection failed, continuing without real-time features:', error.message);
      return null;
    }
  }

  // Safe emit - won't break if socket is not connected
  safeEmit(event, data) {
    try {
      this.emit(event, data);
    } catch (error) {
      console.warn('🔌 Failed to emit event, socket not available:', event);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
