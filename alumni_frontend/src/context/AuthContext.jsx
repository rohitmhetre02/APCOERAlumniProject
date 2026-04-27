import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children, navigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token is still valid (within 14 days)
  const isTokenValid = () => {
    const loginTime = localStorage.getItem('alumni_login_time');
    if (!loginTime) return false;
    
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diffInDays = (now - loginDate) / (1000 * 60 * 60 * 24);
    
    return diffInDays < 14; // Valid for 14 days
  };

  // Load data on app start
  useEffect(() => {
    const token = localStorage.getItem('alumni_token');
    const userData = localStorage.getItem('alumni_user');
    const loginTime = localStorage.getItem('alumni_login_time');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      
      // Check if this is a first-time login session (no login_time)
      if (!loginTime) {
        // This is a temporary first-time login session
        // Don't set as authenticated, but don't clear the session either
        // Let the ResetPassword page handle it
        
        setIsAuthenticated(false);
        setUser(null);
      } else if (isTokenValid()) {
        // Regular login session
        setIsAuthenticated(true);
        setUser(parsedUser);
        
      } else {
        // Token expired, clear storage
        localStorage.removeItem('alumni_token');
        localStorage.removeItem('alumni_user');
        localStorage.removeItem('alumni_login_time');
        setIsAuthenticated(false);
        setUser(null);
        
        // Don't navigate here - let the routing system handle it
        console.log('Token expired, cleared storage');
      }
    } else {
      // No token exists
      setIsAuthenticated(false);
      setUser(null);
      
    }
    setLoading(false);
  }, [navigate]);

  const login = (userData, token) => {
    const loginTime = new Date().toISOString();
    
    // Store data on login
    localStorage.setItem('alumni_token', token);
    localStorage.setItem('alumni_user', JSON.stringify(userData));
    localStorage.setItem('alumni_login_time', loginTime);
    
    // Update state
    setIsAuthenticated(true);
    setUser(userData);
    
    
    
    navigate('/dashboard');
  };

  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('alumni_token');
    localStorage.removeItem('alumni_user');
    localStorage.removeItem('alumni_login_time');
    
    // Update state
    setIsAuthenticated(false);
    setUser(null);
    
    
    
    navigate('/');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
