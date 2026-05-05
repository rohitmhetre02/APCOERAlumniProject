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
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [forgotLoading, setForgotLoading] = useState(false);
  
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

  // Forgot password functions
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password-coordinator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('OTP sent to your email address');
        setForgotStep(2);
      } else {
        alert(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Error sending OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('OTP verified successfully');
        setForgotStep(3);
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Error verifying OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password-coordinator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: forgotEmail, 
          otp,
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password reset successfully! Please login with your new password.');
        handleBackToLogin();
      } else {
        alert(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
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
      <div className="max-w-2xl w-full space-y-8">
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
              <div className="grid grid-cols-2 gap-3">
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
                      <p className="text-xs text-gray-500">Full system access and management</p>
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
                      <p className="text-xs text-gray-500">Department-specific coordination</p>
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
                  onClick={() => setShowForgotPassword(true)}
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
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-2xl bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Forgot Password - Coordinator
                  </h3>
                  <button
                    onClick={handleBackToLogin}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Step 1: Enter Email */}
                {forgotStep === 1 && (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter your coordinator email address
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="coordinator@apcoer.edu"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {forgotLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </form>
                )}

                {/* Step 2: Enter OTP */}
                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter OTP sent to your email
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </form>
                )}

                {/* Step 3: Enter New Password */}
                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {forgotLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

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
