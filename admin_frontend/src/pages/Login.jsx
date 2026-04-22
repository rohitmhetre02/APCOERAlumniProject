import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UserCircleIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' // Default to admin
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'coordinator') {
        navigate('/coordinator/dashboard');
      }
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form inputs
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (!formData.role) {
        setError('Please select your role (Admin or Coordinator)');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      console.log('Sending login data:', {
        email: formData.email
      });

      // Login based on selected role
      let response;
      let data;
      let userData;
      
      if (formData.role === 'admin') {
        // Admin login
        try {
          response = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Admin login failed');
          }

          console.log('Admin login successful:', data);
          userData = data.user;
          
          const adminUser = {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName || 'User',
            email: userData.email,
            role: userData.role,
            department: 'Administration',
            position: 'System Administrator'
          };
          
          console.log('Admin data extracted:', adminUser);
          
          // Use AuthContext login function to store session properly
          login(adminUser, data.token);
          
          console.log('Admin logged in and data stored');
          
          // Navigate to admin dashboard
          navigate('/admin/dashboard');
          
        } catch (adminError) {
          console.error('Admin login failed:', adminError.message);
          throw new Error('Admin login failed. Please check your credentials.');
        }
        
      } else if (formData.role === 'coordinator') {
        // Coordinator login
        try {
          response = await fetch(`${import.meta.env.VITE_API_URL}/auth/coordinator/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Coordinator login failed');
          }

          console.log('Coordinator login response:', data);
          userData = data.user;
          
          const coordinatorUser = {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName || 'User',
            email: userData.email,
            role: userData.role,
            department: userData.department,
            position: 'Department Coordinator',
            isFirstLogin: userData.isFirstLogin
          };
          
          console.log('Coordinator data extracted:', coordinatorUser);
          
          // Check if first time login
          if (userData.isFirstLogin) {
            // Store temporary coordinator session for password reset
            localStorage.setItem('coordinator_token', data.token);
            localStorage.setItem('coordinator_user', JSON.stringify(coordinatorUser));
            
            console.log('First time login, redirecting to password reset');
            console.log('Navigating to: /coordinator/reset-password');
            // Redirect to reset password page
            navigate('/coordinator/reset-password');
            console.log('Navigation called');
          } else {
            // Use AuthContext login function to store session properly
            login(coordinatorUser, data.token);
            
            console.log('Coordinator logged in and data stored');
            
            // Navigate to coordinator dashboard
            navigate('/coordinator/dashboard');
          }
          
        } catch (coordinatorError) {
          console.error('Coordinator login failed:', coordinatorError.message);
          throw new Error('Coordinator login failed. Please check your credentials.');
        }
      } else {
        throw new Error('Invalid role selected');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <AcademicCapIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin & Coordinator Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            APCOER Alumni Management System
          </p>
        </div>

        {/* Login Form */}
        <div className="login-card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircleIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="login-input pl-10"
                  placeholder="admin@apcoer.edu"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Role
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <span className="font-medium text-gray-900">Administrator</span>
                      <p className="text-sm text-gray-500">Full system access and management</p>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="coordinator"
                    checked={formData.role === 'coordinator'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3 flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <span className="font-medium text-gray-900">Coordinator</span>
                      <p className="text-sm text-gray-500">Department-specific coordination</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="login-input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in to Admin Portal'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Admin Credentials:</p>
            <p className="text-xs text-blue-700">Email: admin@apcoer.edu</p>
            <p className="text-xs text-blue-700">Password: Admin@123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need alumni access?{' '}
            <a 
              href={import.meta.env.VITE_ALUMNI_PORTAL} 
              className="font-medium text-blue-600 hover:text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Alumni Portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
