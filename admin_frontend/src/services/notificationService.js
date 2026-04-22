// API service for notifications
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Get all notifications
export const getNotifications = async (limit = 50, offset = 0) => {
  try {
    // Check for both coordinator_token (first login) and admin_token (after first login)
    const coordinatorToken = localStorage.getItem('coordinator_token');
    const adminToken = localStorage.getItem('admin_token');
    const userRole = localStorage.getItem('userRole');
    
    const token = coordinatorToken || adminToken;
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    // Use different endpoints based on user role
    let endpoint;
    if (userRole === 'admin' || (adminToken && !coordinatorToken)) {
      // Admin notifications endpoint
      endpoint = `${API_BASE_URL}/admin/notifications?limit=${limit}&offset=${offset}`;
    } else {
      // Coordinator notifications endpoint
      endpoint = `${API_BASE_URL}/coordinators/notifications?limit=${limit}&offset=${offset}`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread notifications count
export const getUnreadCount = async () => {
  try {
    // Check for both coordinator_token (first login) and admin_token (after first login)
    const coordinatorToken = localStorage.getItem('coordinator_token');
    const adminToken = localStorage.getItem('admin_token');
    const userRole = localStorage.getItem('userRole');
    
    const token = coordinatorToken || adminToken;
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    // Use different endpoints based on user role
    let endpoint;
    if (userRole === 'admin' || (adminToken && !coordinatorToken)) {
      // Admin notifications endpoint
      endpoint = `${API_BASE_URL}/admin/notifications/unread-count`;
    } else {
      // Coordinator notifications endpoint
      endpoint = `${API_BASE_URL}/coordinators/notifications/unread-count`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    // Check for both coordinator_token (first login) and admin_token (after first login)
    const coordinatorToken = localStorage.getItem('coordinator_token');
    const adminToken = localStorage.getItem('admin_token');
    const userRole = localStorage.getItem('userRole');
    
    const token = coordinatorToken || adminToken;
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    // Use different endpoints based on user role
    let endpoint;
    if (userRole === 'admin' || (adminToken && !coordinatorToken)) {
      // Admin notifications endpoint
      endpoint = `${API_BASE_URL}/admin/notifications/${notificationId}/read`;
    } else {
      // Coordinator notifications endpoint
      endpoint = `${API_BASE_URL}/coordinators/notifications/${notificationId}/read`;
    }

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    // Check for both coordinator_token (first login) and admin_token (after first login)
    const token = localStorage.getItem('coordinator_token') || localStorage.getItem('admin_token');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/coordinators/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    // Check for both coordinator_token (first login) and admin_token (after first login)
    const token = localStorage.getItem('coordinator_token') || localStorage.getItem('admin_token');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/coordinators/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};
