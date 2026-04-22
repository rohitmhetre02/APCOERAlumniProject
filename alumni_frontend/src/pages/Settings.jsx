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
  ArrowPathIcon,
  UserIcon
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Update States
  const [profileSection, setProfileSection] = useState('initial'); // initial, edit, success
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    graduationYear: '',
    currentCompany: '',
    jobTitle: '',
    linkedinProfile: ''
  });

  // Delete Account States
  const [deleteSection, setDeleteSection] = useState('initial'); // initial, password, success
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Forget Password States
  const [forgetPasswordSection, setForgetPasswordSection] = useState('initial'); // initial, otp, newpassword, success
  const [forgetPasswordOtp, setForgetPasswordOtp] = useState('');
  const [forgetPasswordNew, setForgetPasswordNew] = useState('');
  const [forgetPasswordConfirm, setForgetPasswordConfirm] = useState('');
  const [showForgetNewPassword, setShowForgetNewPassword] = useState(false);
  const [showForgetConfirmPassword, setShowForgetConfirmPassword] = useState(false);

  useEffect(() => {
    // Initialize profile data
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        department: user.department || '',
        graduationYear: user.graduationYear || '',
        currentCompany: user.currentCompany || '',
        jobTitle: user.jobTitle || '',
        linkedinProfile: user.linkedinProfile || ''
      });
    }
  }, [user]);

  useEffect(() => {
    setError('');
    setSuccess('');
  }, [emailSection, passwordSection, deleteSection, forgetPasswordSection, profileSection]);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email-update-otp`, {
        method: 'POST',
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
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSection('success');
        setSuccess('Password updated successfully!');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setError(data.message || 'Failed to update password. Please try again.');
      }
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Profile Update Functions
  const handleProfileUpdateStart = () => {
    setProfileSection('edit');
    setError('');
    setSuccess('');
  };

  const updateProfile = async () => {
    if (!profileData.firstName || !profileData.lastName) {
      setError('First name and last name are required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setProfileSection('success');
        setSuccess('Profile updated successfully!');
        updateUser({ ...user, ...profileData });
      } else {
        setError(data.message || 'Failed to update profile. Please try again.');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Forget Password Functions
  const handleForgetPassword = () => {
    setForgetPasswordSection('otp');
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
        setSuccess('OTP sent to your registered email address');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
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

  // Delete Account Functions
  const handleDeleteAccount = () => {
    setDeleteSection('password');
    setError('');
    setSuccess('');
  };

  const deleteAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password to confirm account deletion');
      return;
    }

    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove all your data.')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });

      const data = await response.json();

      if (response.ok) {
        setDeleteSection('success');
        setSuccess('Account deleted successfully. You will be logged out...');
        setTimeout(() => {
          localStorage.removeItem('alumni_token');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.message || 'Wrong password. Account deletion failed.');
      }
    } catch (err) {
      setError('Failed to delete account. Please try again.');
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
        setNewPassword('');
        setConfirmNewPassword('');
        break;
      case 'delete':
        setDeleteSection('initial');
        setDeletePassword('');
        break;
      case 'forget':
        setForgetPasswordSection('initial');
        setForgetPasswordOtp('');
        setForgetPasswordNew('');
        setForgetPasswordConfirm('');
        break;
      case 'profile':
        setProfileSection('initial');
        break;
    }
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3">
        <Cog6ToothIcon className="h-8 w-8 text-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your alumni account settings and preferences</p>
        </div>
      </div>

      {/* Profile Update Section */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserIcon className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>

          {profileSection === 'initial' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="text-lg font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg font-medium text-gray-900">{user?.phone || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="text-lg font-medium text-gray-900">{user?.department || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Graduation Year</p>
                  <p className="text-lg font-medium text-gray-900">{user?.graduationYear || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Company</p>
                  <p className="text-lg font-medium text-gray-900">{user?.currentCompany || 'Not specified'}</p>
                </div>
              </div>
              <Button onClick={handleProfileUpdateStart}>
                Update Profile
              </Button>
            </div>
          )}

          {profileSection === 'edit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <Input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <Input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <Input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                  <Input
                    type="text"
                    value={profileData.graduationYear}
                    onChange={(e) => setProfileData({...profileData, graduationYear: e.target.value})}
                    placeholder="Enter graduation year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
                  <Input
                    type="text"
                    value={profileData.currentCompany}
                    onChange={(e) => setProfileData({...profileData, currentCompany: e.target.value})}
                    placeholder="Enter current company"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <Input
                    type="text"
                    value={profileData.jobTitle}
                    onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                    placeholder="Enter job title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                  <Input
                    type="url"
                    value={profileData.linkedinProfile}
                    onChange={(e) => setProfileData({...profileData, linkedinProfile: e.target.value})}
                    placeholder="Enter LinkedIn profile URL"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={updateProfile} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button variant="outline" onClick={() => resetSection('profile')}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {profileSection === 'success' && (
            <div className="text-center py-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-medium text-gray-900">Profile updated successfully!</p>
              <Button onClick={() => resetSection('profile')} className="mt-4">
                Done
              </Button>
            </div>
          )}
        </div>
      </Card>

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
          {forgetPasswordSection === 'otp' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-md font-medium text-gray-900">Forget Password</h3>
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

      {/* Delete Account Section */}
      <Card className="border-red-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrashIcon className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Delete Account</h2>
          </div>

          {deleteSection === 'initial' && (
            <div className="space-y-4">
              <p className="text-sm text-red-600">
                <strong>Warning:</strong> This action cannot be undone and will permanently delete all your data including:
              </p>
              <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                <li>Your profile information and academic details</li>
                <li>Job applications and event registrations</li>
                <li>Messages and connections</li>
                <li>Account settings and preferences</li>
              </ul>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete My Account
              </Button>
            </div>
          )}

          {deleteSection === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Password to Confirm Deletion
                </label>
                <div className="relative">
                  <Input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showDeletePassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={deleteAccount} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete Account'}
                </Button>
                <Button variant="outline" onClick={() => resetSection('delete')}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {deleteSection === 'success' && (
            <div className="text-center py-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-medium text-gray-900">Account deleted successfully!</p>
              <p className="text-sm text-gray-600">You will be logged out automatically...</p>
            </div>
          )}
        </div>
      </Card>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
