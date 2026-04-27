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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove /api from base URL if it exists to avoid double /api
  const CLEAN_API_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
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
          setUnreadCounts(prev => {
            const newCounts = {
              ...prev,
              [data.senderId]: (prev[data.senderId] || 0) + 1
            };
            // Save to localStorage for persistence
            localStorage.setItem('admin_unread_counts', JSON.stringify(newCounts));
            return newCounts;
          });
        }
      });

      return () => {
        disconnectSocket();
      };
    }
  }, []);

  // Load unread counts from localStorage on mount
  useEffect(() => {
    try {
      const savedCounts = localStorage.getItem('admin_unread_counts');
      if (savedCounts) {
        const counts = JSON.parse(savedCounts);
        setUnreadCounts(counts);
        console.log('Loaded admin unread counts from localStorage in MessageContext:', counts);
      }
    } catch (error) {
      console.error('Error loading admin unread counts from localStorage:', error);
    }
  }, []);

  const markAsRead = () => {
    setUnreadCounts({});
    localStorage.removeItem('admin_unread_counts');
  };

  const markAsReadForContact = (contactId) => {
    setUnreadCounts(prev => {
      const newCounts = {
        ...prev,
        [contactId]: 0
      };
      localStorage.setItem('admin_unread_counts', JSON.stringify(newCounts));
      return newCounts;
    });
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
