// API service for authentication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Show error message to user
const showError = (message) => {
  // You can replace this with a toast notification or alert
  console.error('Error:', message);
  // Import and use notification system
  if (typeof window !== 'undefined' && window.showNotificationError) {
    window.showNotificationError(message);
  } else {
    alert(message);
  }
};

// Show success message to user
const showSuccess = (message) => {
  // You can replace this with a toast notification or alert
  console.log('Success:', message);
  // Import and use notification system
  if (typeof window !== 'undefined' && window.showNotificationSuccess) {
    window.showNotificationSuccess(message);
  } else {
    alert(message);
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await handleResponse(response);
    showSuccess(data.message || 'Registration successful! Please wait for admin approval.');
    return data;
  } catch (error) {
    showError(error.message || 'Registration failed');
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await handleResponse(response);
    showSuccess(data.message || 'Login successful!');
    return data;
  } catch (error) {
    showError(error.message || 'Login failed');
    throw error;
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('alumni_token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return data;
  } catch (error) {
    showError(error.message || 'Failed to get user profile');
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('alumni_token');
    if (token) {
      // You can add a logout API call here if needed
      // await fetch(`${API_BASE_URL}/auth/logout`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
    }
    
    // Remove token from localStorage
    localStorage.removeItem('alumni_token');
    localStorage.removeItem('alumni_user');
    return true;
  } catch (error) {
    showError(error.message || 'Logout failed');
    throw error;
  }
};

// Validate token
export const validateToken = async () => {
  try {
    const token = localStorage.getItem('alumni_token');
    if (!token) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};
