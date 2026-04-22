import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { registerUser } from '../services/authService';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    prnNumber: '',
    contactNumber: '',
    department: '',
    passoutYear: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Setup global notification functions for authService
  useEffect(() => {
    window.showNotificationSuccess = showSuccess;
    window.showNotificationError = showError;
    
    return () => {
      delete window.showNotificationSuccess;
      delete window.showNotificationError;
    };
  }, [showSuccess, showError]);

  const departments = [
    'Civil Engineering',
    'Computer Engineering',
    'Information Technology',
    'Electronics & Telecommunication Engineering',
    'Mechanical Engineering',
    'Artificial Intelligence & Data Science',
    'Electronics Engineering (VLSI Design And Technology)',
    'Electronics & Communication (Advanced Communication Technology)'
  ];

  // Generate passout year options (2012 to current year)
  const currentYear = new Date().getFullYear();
  const passoutYears = [];
  for (let year = currentYear; year >= 2012; year--) {
    passoutYears.push(year);
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate form
      const newErrors = {};
      
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.prnNumber) {
        newErrors.prnNumber = 'PRN number is required';
      } else if (!/^[0-9]{8}[A-Z]$/.test(formData.prnNumber)) {
        newErrors.prnNumber = 'PRN number must be in format: 8 digits followed by 1 uppercase letter (e.g., 72264568G)';
      }
      
      if (!formData.contactNumber) {
        newErrors.contactNumber = 'Contact number is required';
      } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
        newErrors.contactNumber = 'Contact number must be exactly 10 digits';
      }
      
      if (!formData.department) {
        newErrors.department = 'Please select your department';
      }
      
      if (!formData.passoutYear) {
        newErrors.passoutYear = 'Please select your passout year';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/;
        if (!passwordRegex.test(formData.password)) {
          newErrors.password = 'Password must be 6-10 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character';
        }
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Call backend API
      console.log('Sending registration data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        prnNumber: formData.prnNumber,
        contactNumber: formData.contactNumber,
        department: formData.department,
        passoutYear: formData.passoutYear,
        password: formData.password
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          prnNumber: formData.prnNumber,
          contactNumber: formData.contactNumber,
          department: formData.department,
          passoutYear: formData.passoutYear,
          password: formData.password
        }),
      }); console.log('Registration response:', response);

      // Show success message and redirect to login
      console.log('Registration successful!');
      showSuccess('Registration successful! Please wait for coordinator approval before logging in.', 8000);
      navigate('/');
      
    } catch (error) {
      console.error('Registration error:', error);
      // Error is already handled in authService
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-4">
        <div>
          <h2 className="text-center text-2xl font-extrabold text-gray-900">
            Alumni Register
          </h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-2xl shadow-lg bg-white p-5 space-y-3">
            <div className="space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-0.5">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm ${
                      errors.firstName 
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm ${
                      errors.lastName 
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email and Contact Number in same row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm ${
                      errors.email 
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    required
                    maxLength="10"
                    className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm ${
                      errors.contactNumber 
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="10-digit mobile number"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
                  )}
                </div>
              </div>

              {/* PRN Number and Passout Year in same row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prnNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    PRN Number
                  </label>
                  <input
                    id="prnNumber"
                    name="prnNumber"
                    type="text"
                    required
                    maxLength="9"
                    className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm ${
                      errors.prnNumber 
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="e.g., 72264568G"
                    value={formData.prnNumber}
                    onChange={handleChange}
                  />
                  {errors.prnNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.prnNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="passoutYear" className="block text-sm font-medium text-gray-700 mb-1">
                    Passout Year
                  </label>
                  <select
                    id="passoutYear"
                    name="passoutYear"
                    required
                    className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm ${
                      errors.passoutYear 
                        ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    value={formData.passoutYear}
                    onChange={handleChange}
                  >
                    <option value="">Select passout year</option>
                    {passoutYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.passoutYear && (
                    <p className="mt-1 text-sm text-red-600">{errors.passoutYear}</p>
                  )}
                </div>
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm ${
                    errors.department 
                      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select your department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`appearance-none relative block w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm ${
                      errors.password 
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    }`}
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
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`appearance-none relative block w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm ${
                      errors.confirmPassword 
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
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
                    Registering...
                  </div>
                ) : (
                  'Register'
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/"
                  className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                >
                  Login here
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
