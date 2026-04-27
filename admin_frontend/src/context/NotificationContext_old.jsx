import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      
      if (response.status === 'success') {
        setNotifications(response.data || []);
        // Note: unreadCount should be fetched separately or calculated from notifications
        const unreadNotifications = (response.data || []).filter(n => !n.is_read);
        setUnreadCount(unreadNotifications.length);
      } else {
        // Handle non-success responses
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Ensure notifications is always an array even on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle new notification from socket
  const handleNewNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast or update UI
    console.log('📢 New notification received in context:', notification);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await markNotificationAsRead(notificationId);
      
      if (response.status === 'success') {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await markAllNotificationsAsRead();
      
      if (response.status === 'success') {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      console.log('⚠️ No admin token, skipping socket connection');
      return;
    }

    // Request notification permission
    socketService.requestNotificationPermission();

    // Connect to socket safely
    const socket = socketService.connectOptional();
    
    if (socket) {
      setSocketConnected(true);
      
      // Listen for new notifications
      socketService.on('new_notification', handleNewNotification);
      
      // Listen for connection events
      socket.on('connect', () => setSocketConnected(true));
      socket.on('disconnect', () => setSocketConnected(false));
    } else {
      console.log('🔌 Socket connection not available, continuing without real-time features');
      setSocketConnected(false);
    }

    // Initial fetch
    fetchNotifications();

    // Cleanup
    return () => {
      if (socket) {
        socketService.off('new_notification', handleNewNotification);
      }
    };
  }, [fetchNotifications, handleNewNotification]);

  const value = {
    notifications,
    unreadCount,
    loading,
    socketConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
