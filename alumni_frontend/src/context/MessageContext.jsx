import React, { createContext, useContext, useState, useEffect } from 'react';
import { connectSocket, disconnectSocket } from '../socket';

const MessageContext = createContext();

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const [unreadCounts, setUnreadCounts] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);

  // Calculate total unread count
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    const token = localStorage.getItem('alumni_token');
    if (token) {
      const userData = JSON.parse(atob(token.split('.')[1]));
      
      const socket = connectSocket(userData);

      socket.on('connect', () => {
        console.log('Message context connected to server');
        setSocketConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Message context disconnected from server');
        setSocketConnected(false);
      });

      socket.on('new-message', (data) => {
        // Update unread count for received messages
        if (data.receiverId === userData.id) {
          setUnreadCounts(prev => ({
            ...prev,
            [data.senderId]: (prev[data.senderId] || 0) + 1
          }));
        }
      });

      return () => {
        disconnectSocket();
      };
    }
  }, []);

  
  const markAsRead = () => {
    setUnreadCounts({});
  };

  const markAsReadForContact = (contactId) => {
    setUnreadCounts(prev => ({
      ...prev,
      [contactId]: 0
    }));
  };

  const value = {
    unreadCount: totalUnreadCount,
    unreadCounts,
    socketConnected,
    markAsRead,
    markAsReadForContact
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
