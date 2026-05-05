import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Environment variables
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'admin_token';
const USER_KEY = import.meta.env.VITE_USER_KEY || 'admin_user';
const SESSION_TIMEOUT = import.meta.env.VITE_SESSION_TIMEOUT || 24;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token is still valid (within session timeout days)
  const isTokenValid = () => {
    const loginTime = localStorage.getItem('admin_login_time');
    if (!loginTime) return false;
    
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diffInDays = (now - loginDate) / (1000 * 60 * 60 * 24);
    
    return diffInDays < SESSION_TIMEOUT; // Use environment variable
  };

  // Load data on app start
  useEffect(() => {
    // Try to restore admin session first
    const adminToken = localStorage.getItem(TOKEN_KEY);
    const adminUser = localStorage.getItem(USER_KEY);
    const userRole = localStorage.getItem('userRole');
    
    if (adminToken && adminUser && userRole) {
      if (isTokenValid()) {
        // Restore session (admin or coordinator)
        const userData = JSON.parse(adminUser);
        setUser(userData);
        console.log(`Session restored for ${userRole} from localStorage`);
      } else {
        // Token expired, clear storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('userRole');
        localStorage.removeItem('admin_login_time');
        setUser(null);
        console.log(`Session expired, cleared localStorage`);
      }
    } else {
      // Try to restore coordinator session (first-time login flow)
      const coordinatorToken = localStorage.getItem('coordinator_token');
      const coordinatorUser = localStorage.getItem('coordinator_user');
      
      if (coordinatorToken && coordinatorUser) {
        const coordinatorData = JSON.parse(coordinatorUser);
        
        // Only restore if coordinator has completed first login
        if (!coordinatorData.isFirstLogin) {
          // Move coordinator session to main auth storage
          localStorage.setItem(TOKEN_KEY, coordinatorToken);
          localStorage.setItem(USER_KEY, coordinatorUser);
          localStorage.setItem('userRole', 'coordinator');
          localStorage.setItem('admin_login_time', new Date().toISOString());
          // Clear temporary coordinator storage
          localStorage.removeItem('coordinator_token');
          localStorage.removeItem('coordinator_user');
          
          setUser(coordinatorData);
          console.log('Coordinator session restored and promoted to main session');
        } else {
          console.log('Coordinator first login not completed, session not restored');
          setUser(null);
        }
      } else {
        // No session exists
        setUser(null);
        console.log('No session found in localStorage');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const loginTime = new Date().toISOString();
    const adminToken = token || `admin-${userData.id}-${Date.now()}`;
    
    console.log('🔐 Login function called:', {
      role: userData.role,
      email: userData.email,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      isFirstLogin: userData.isFirstLogin,
      status: userData.status
    });
    
    // Store data on login
    localStorage.setItem(TOKEN_KEY, adminToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('admin_login_time', loginTime);
    
    // Update state
    setUser(userData);
    
    console.log(`✅ ${userData.role} logged in, data stored in localStorage`);
    console.log('📝 Token stored:', adminToken.substring(0, 20) + '...');
    console.log('👤 User stored:', userData.email);
    console.log('🔑 Role stored:', userData.role);
    console.log('📅 Login time stored:', loginTime);
    console.log('🔄 User state updated:', userData);
  };

  const logout = () => {
    // Remove all session data from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('userRole');
    localStorage.removeItem('admin_login_time');
    localStorage.removeItem('coordinator_token');
    localStorage.removeItem('coordinator_user');
    
    // Update state
    setUser(null);
    
    console.log('User logged out, all session data cleared');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
