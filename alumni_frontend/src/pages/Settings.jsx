import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Cog6ToothIcon,
  EnvelopeIcon,
  LockClosedIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email Update States
  const [emailSection, setEmailSection] = useState('initial'); // initial, password, newemail, otp, success
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Password Change States
  const [passwordSection, setPasswordSection] = useState('initial'); // initial, enter, new, success
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState('');
  const [verifiedPassword, setVerifiedPassword] = useState(''); // Store verified password
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  // Forget Password States
  const [forgetPasswordSection, setForgetPasswordSection] = useState('initial'); // initial, otp, newpassword, success
  const [forgetPasswordOtp, setForgetPasswordOtp] = useState('');
  const [forgetPasswordNew, setForgetPasswordNew] = useState('');
  const [forgetPasswordConfirm, setForgetPasswordConfirm] = useState('');
  const [showForgetNewPassword, setShowForgetNewPassword] = useState(false);
  const [showForgetConfirmPassword, setShowForgetConfirmPassword] = useState(false);

  
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [emailSection, passwordSection, forgetPasswordSection]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Email Update Functions
  const handleEmailUpdateStart = () => {
    setEmailSection('password');
    setError('');
    setSuccess('');
  };

  const verifyCurrentPassword = async () => {
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: currentPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSection('newemail');
        setCurrentPassword('');
      } else {
        setError(data.message || 'Wrong password. Please enter the correct password.');
      }
    } catch (err) {
      setError('Failed to verify password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailUpdateOTP = async () => {
    if (!newEmail) {
      setError('Please enter your new email address');
      return;
    }

    if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-email-update-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSection('otp');
        setSuccess('OTP sent to your new email address');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailUpdateOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/update-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp, newEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSection('success');
        setSuccess('Email updated successfully!');
        updateUser({ ...user, email: newEmail });
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password Change Functions
  const handlePasswordChangeStart = () => {
    setPasswordSection('enter');
    setError('');
    setSuccess('');
  };

  const verifyPasswordForChange = async () => {
    if (!passwordCurrentPassword) {
      setError('Please enter your current password');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: passwordCurrentPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSection('new');
        setVerifiedPassword(passwordCurrentPassword); // Store verified password
        setPasswordCurrentPassword('');
      } else {
        setError(data.message || 'Wrong password. Please enter the correct password.');
      }
    } catch (err) {
      setError('Failed to verify password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      setError('Please enter both new password fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: verifiedPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSection('success');
        setSuccess('Password updated successfully!');
        setNewPassword('');
        setConfirmNewPassword('');
        setVerifiedPassword(''); // Clear verified password
      } else {
        setError(data.message || 'Failed to update password. Please try again.');
      }
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  
  // Forget Password Functions
  const handleForgetPassword = () => {
    setForgetPasswordSection('email');
    setError('');
    setSuccess('');
    sendForgetPasswordOTP();
  };

  const sendForgetPasswordOTP = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-forget-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setForgetPasswordSection('otp');
        setSuccess(`OTP sent to your registered email: ${data.email || user?.email}`);
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
        setForgetPasswordSection('initial');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      setForgetPasswordSection('initial');
    } finally {
      setLoading(false);
    }
  };

  const verifyForgetPasswordOTP = async () => {
    if (!forgetPasswordOtp || forgetPasswordOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-forget-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp: forgetPasswordOtp })
      });

      const data = await response.json();

      if (response.ok) {
        setForgetPasswordSection('newpassword');
        setSuccess('OTP verified. Please enter your new password.');
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateForgetPassword = async () => {
    if (!forgetPasswordNew || !forgetPasswordConfirm) {
      setError('Please enter both password fields');
      return;
    }

    if (forgetPasswordNew !== forgetPasswordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (forgetPasswordNew.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/update-password-with-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          otp: forgetPasswordOtp,
          newPassword: forgetPasswordNew 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setForgetPasswordSection('success');
        setSuccess('Password updated successfully!');
        setForgetPasswordOtp('');
        setForgetPasswordNew('');
        setForgetPasswordConfirm('');
      } else {
        setError(data.message || 'Failed to update password. Please try again.');
      }
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  
  const resetSection = (section) => {
    switch(section) {
      case 'email':
        setEmailSection('initial');
        setCurrentPassword('');
        setNewEmail('');
        setOtp('');
        break;
      case 'password':
        setPasswordSection('initial');
        setPasswordCurrentPassword('');
        setVerifiedPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        break;
            case 'forget':
        setForgetPasswordSection('initial');
        setForgetPasswordOtp('');
        setForgetPasswordNew('');
        setForgetPasswordConfirm('');
        break;
    }
    setError('');
    setSuccess('');
  };

  return (
    <>
      {/* Toast Notifications - Fixed Position Top-Right */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3 shadow-lg animate-pulse">
            <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800 flex-1">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800 flex-shrink-0"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-3 shadow-lg animate-pulse">
            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 flex-1">{success}</p>
            <button
              onClick={() => setSuccess('')}
              className="text-green-600 hover:text-green-800 flex-shrink-0"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3">
          <Cog6ToothIcon className="h-8 w-8 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your alumni account settings and preferences</p>
          </div>
        </div>

      {/* Email Update Section */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <EnvelopeIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Email Address</h2>
          </div>

          {emailSection === 'initial' && (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Current email address</p>
                <p className="text-lg font-medium text-gray-900">{user?.email}</p>
              </div>
              <Button onClick={handleEmailUpdateStart}>
                Update Email
              </Button>
            </div>
          )}

          {emailSection === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={verifyCurrentPassword} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Password'}
                </Button>
                <Button variant="outline" onClick={() => resetSection('email')}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {emailSection === 'newemail' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter New Email Address
                </label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your new email address"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={sendEmailUpdateOTP} disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
                <Button variant="outline" onClick={() => resetSection('email')}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {emailSection === 'otp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP sent to {newEmail}
                </label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={verifyEmailUpdateOTP} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button variant="outline" onClick={() => sendEmailUpdateOTP()} disabled={loading}>
                  Resend OTP
                </Button>
                <Button variant="outline" onClick={() => resetSection('email')}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {emailSection === 'success' && (
            <div className="text-center py-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-medium text-gray-900">Email updated successfully!</p>
              <p className="text-sm text-gray-600 mb-4">Your email is now: {newEmail}</p>
              <Button onClick={() => resetSection('email')}>
                Done
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Password Section */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <LockClosedIcon className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Password</h2>
          </div>

          {passwordSection === 'initial' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Change your account password</p>
              <div className="flex gap-2">
                <Button onClick={handlePasswordChangeStart}>
                  Update Password
                </Button>
                <Button variant="outline" onClick={handleForgetPassword}>
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Forget Password
                </Button>
              </div>
            </div>
          )}

          {passwordSection === 'enter' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswordCurrent ? 'text' : 'password'}
                    value={passwordCurrentPassword}
                    onChange={(e) => setPasswordCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordCurrent ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={verifyPasswordForChange} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Password'}
                </Button>
                <Button variant="outline" onClick={() => resetSection('password')}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {passwordSection === 'new' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={updatePassword} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
                <Button variant="outline" onClick={() => resetSection('password')}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {passwordSection === 'success' && (
            <div className="text-center py-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-medium text-gray-900">Password updated successfully!</p>
              <Button onClick={() => resetSection('password')} className="mt-4">
                Done
              </Button>
            </div>
          )}

          {/* Forget Password Section */}
          {forgetPasswordSection === 'email' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-md font-medium text-gray-900">Forget Password</h3>
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Sending OTP to your registered email...</p>
              </div>
            </div>
          )}

          {forgetPasswordSection === 'otp' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-md font-medium text-gray-900">Forget Password</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>OTP sent to:</strong> {user?.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP sent to your registered email
                </label>
                <Input
                  type="text"
                  value={forgetPasswordOtp}
                  onChange={(e) => setForgetPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={verifyForgetPasswordOTP} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button variant="outline" onClick={() => sendForgetPasswordOTP()} disabled={loading}>
                  Resend OTP
                </Button>
                <Button variant="outline" onClick={() => resetSection('forget')}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {forgetPasswordSection === 'newpassword' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-md font-medium text-gray-900">Set New Password</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter New Password
                </label>
                <div className="relative">
                  <Input
                    type={showForgetNewPassword ? 'text' : 'password'}
                    value={forgetPasswordNew}
                    onChange={(e) => setForgetPasswordNew(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgetNewPassword(!showForgetNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showForgetNewPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showForgetConfirmPassword ? 'text' : 'password'}
                    value={forgetPasswordConfirm}
                    onChange={(e) => setForgetPasswordConfirm(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgetConfirmPassword(!showForgetConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showForgetConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={updateForgetPassword} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
                <Button variant="outline" onClick={() => resetSection('forget')}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {forgetPasswordSection === 'success' && (
            <div className="text-center py-4 border-t">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-medium text-gray-900">Password updated successfully!</p>
              <Button onClick={() => resetSection('forget')} className="mt-4">
                Done
              </Button>
            </div>
          )}
        </div>
      </Card>

      </div>
      </>
  );
};

export default Settings;
