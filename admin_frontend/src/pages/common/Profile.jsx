import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, PencilIcon } from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Initialize with user data from auth context
  const [profile, setProfile] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.contact_number || '',
    role: user?.role || '',
    department: user?.department || '',
    createdAt: user?.created_at || '',
    prnNumber: user?.prn_number || '',
    passoutYear: user?.passout_year || ''
  });

  const [editForm, setEditForm] = useState({...profile});

  const handleEdit = () => {
    setEditForm({...profile});
    setIsEditing(true);
  };

  // Fetch user profile from database
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      
      const data = await response.json();
      console.log('Profile API response:', data);
      
      if (data.success) {
        const userData = data.data || data.user; // Handle both response structures
        console.log('User data from API:', userData);
        
        if (!userData) {
          throw new Error('No user data received from server');
        }
        
        setProfile({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          phone: userData.contact_number || '',
          role: userData.role || '',
          department: userData.department || '',
          createdAt: userData.created_at || '',
          prnNumber: userData.prn_number || '',
          passoutYear: userData.passout_year || ''
        });
        setEditForm({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          phone: userData.contact_number || '',
          role: userData.role || '',
          department: userData.department || '',
          createdAt: userData.created_at || '',
          prnNumber: userData.prn_number || '',
          passoutYear: userData.passout_year || ''
        });
      } else {
        throw new Error(data.message || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
      
      // Fallback to auth context data if API fails
      if (user) {
        console.log('Using fallback data from auth context');
        setProfile({
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          phone: user.contact_number || '',
          role: user.role || '',
          department: user.department || '',
          createdAt: user.created_at || '',
          prnNumber: user.prn_number || '',
          passoutYear: user.passout_year || ''
        });
        setEditForm({
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          phone: user.contact_number || '',
          role: user.role || '',
          department: user.department || '',
          createdAt: user.created_at || '',
          prnNumber: user.prn_number || '',
          passoutYear: user.passout_year || ''
        });
        setError(''); // Clear error since we have fallback data
      }
    } finally {
      setLoading(false);
    }
  };

  // Update profile in database
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const updateData = {
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        contact_number: editForm.phone,
        prn_number: editForm.prnNumber,
        passout_year: editForm.passoutYear
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      if (data.success) {
        setProfile({...editForm});
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditForm({...profile});
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const getRoleColor = () => {
    return user?.role === 'coordinator' ? 'green' : 'blue';
  };

  const getRoleBgColor = () => {
    return user?.role === 'coordinator' ? 'bg-green-600' : 'bg-blue-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        </div>
        <div className="max-w-4xl">
          <Card className="p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-800">Error loading profile: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  const getRoleDisplay = () => {
    if (profile.role === 'admin') return 'Administrator';
    if (profile.role === 'coordinator') return 'Department Coordinator';
    if (profile.role === 'alumni') return 'Alumni';
    return profile.role;
  };

  const getDepartmentDisplay = () => {
    if (profile.role === 'admin') return 'Administration';
    return profile.department || 'Not specified';
  };

  const getJoinDate = () => {
    if (profile.createdAt) {
      return new Date(profile.createdAt).getFullYear();
    }
    return 'Not specified';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your {profile.role} profile information</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl">
        <Card className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture and Basic Info */}
            <div className="lg:col-span-1">
              <div className="text-center">
                {/* Profile Picture */}
                <div className={`w-32 h-32 ${getRoleBgColor()} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <UserCircleIcon className="w-20 h-20 text-white" />
                </div>
                
                {/* Basic Info */}
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : 'User Name'}
                </h2>
                <p className={`text-${getRoleColor()}-600 font-medium`}>{getRoleDisplay()}</p>
                <p className="text-gray-600">{getDepartmentDisplay()}</p>
                
                {/* Contact Info */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <PhoneIcon className="w-4 h-4" />
                    <span className="text-sm">{profile.phone || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span className="text-sm">Since {getJoinDate()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-700">{profile.firstName || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-700">{profile.lastName || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-700">{profile.phone || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-700">{profile.email}</p>
                  </div>
                  {profile.role === 'alumni' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PRN Number</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="prnNumber"
                            value={editForm.prnNumber}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-700">{profile.prnNumber || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passout Year</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="passoutYear"
                            value={editForm.passoutYear}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-700">{profile.passoutYear || 'Not specified'}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
