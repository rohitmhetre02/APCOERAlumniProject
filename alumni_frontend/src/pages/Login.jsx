import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { loginUser } from '../services/authService';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Setup global notification functions for authService
  useEffect(() => {
    window.showNotificationSuccess = showSuccess;
    window.showNotificationError = showError;
    
    return () => {
      delete window.showNotificationSuccess;
      delete window.showNotificationError;
    };
  }, [showSuccess, showError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        alert('Please fill in all fields');
        setLoading(false);
        return;
      }

      

      console.log('Attempting alumni login:', {
        email: formData.email,
        password: formData.password
      });

      const response = await loginUser({
        email: formData.email,
        password: formData.password
      });

      console.log('Alumni login response:', response);

      // Extract user data from backend response
      const userData = {
        id: response.user.id,
        firstName: response.user.firstName,
        lastName: response.user.lastName || '',
        email: response.user.email,
        role: response.user.role,
        isFirstLogin: response.user.isFirstLogin || false,
        status: response.user.status || 'active'
      };

      console.log('Extracted user data:', userData);
      
      
      
      // Use the JWT token from backend
      const token = response.token;
      
      
      
      // Check if it's first login - redirect to reset password
      console.log('Checking first-time login:', {
        isFirstLogin: userData.isFirstLogin,
        token: token ? 'Token received' : 'No token'
      });

      if (userData.isFirstLogin) {
        console.log('First-time login detected, redirecting to reset password');
        
        // Store temporary session for password reset
        localStorage.setItem('alumni_token', token);
        localStorage.setItem('alumni_user', JSON.stringify(userData));
        
        // Show notification
        showSuccess('Welcome! Please set your password to activate your account.', 5000);
        
        // Navigate to reset password page
        navigate('/reset-password');
        return;
      }
      
      // Regular login - store in localStorage
      login(userData, token);
      
      console.log('User logged in and data stored');
      console.log('📊 Final user status:', userData.status);
      
      // Show success notification
      showSuccess(`Welcome back, ${userData.firstName}!`, 5000);
      
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled in authService
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Alumni Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl shadow-lg bg-white p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                >
                  Register here
                </Link>
              </span>
            </div>
            
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">Administrator? </span>
              <a 
                href="http://localhost:5174/admin" 
                className="font-medium text-blue-600 hover:text-blue-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Admin Portal
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
