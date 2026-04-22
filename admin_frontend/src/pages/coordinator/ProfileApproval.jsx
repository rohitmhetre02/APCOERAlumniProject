import React, { useState, useEffect } from 'react';
import { 
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CalendarIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

const ProfileApproval = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Profile counts
  const [profileCounts, setProfileCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // Fetch pending users on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPendingUsers(),
      fetchAllUsers()
    ]);
  };

  // Fetch all users with status
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('coordinator_token') || localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coordinators/all-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        const users = data.data || [];
        
        // Count users by status using is_approved field from backend
        const counts = {
          pending: users.filter(u => u.is_approved === false && u.role === 'alumni').length,
          approved: users.filter(u => u.is_approved === true && u.role === 'alumni').length,
          rejected: 0, // Backend doesn't track rejected status separately
          total: users.filter(u => u.role === 'alumni').length
        };
        
        setProfileCounts(counts);
      } else {
        console.error('Failed to fetch all users:', data.message);
        // Set default counts on error
        setProfileCounts({ pending: 0, approved: 0, rejected: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      // Set default counts on error
      setProfileCounts({ pending: 0, approved: 0, rejected: 0, total: 0 });
    }
  };

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending users for profile approval...');
      
      // Check for both coordinator_token (first login) and admin_token (after first login)
      const token = localStorage.getItem('coordinator_token') || localStorage.getItem('admin_token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coordinators/pending-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Pending users API response:', data);
      
      if (data.status === 'success') {
        setProfiles(data.data || []);
        console.log(`Fetched ${data.data?.length || 0} pending users`);
      } else {
        console.error('Failed to fetch pending users:', data.message);
        setProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      // First try to find the user in the existing profiles data (more efficient)
      const existingUser = profiles.find(profile => profile.id === userId);
      
      if (existingUser) {
        // Use existing data if available (avoids network issues)
        setSelectedProfile(existingUser);
        setShowDetailModal(true);
        return;
      }
      
      // Fallback: Fetch from API if not found in existing data
      const token = localStorage.getItem('coordinator_token') || localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coordinators/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setSelectedProfile(data.data);
        setShowDetailModal(true);
      } else {
        console.error('Failed to fetch user details:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(true);
      console.log('Approving user:', userId);
      
      // Check for both coordinator_token (first login) and admin_token (after first login)
      const token = localStorage.getItem('coordinator_token') || localStorage.getItem('admin_token');
      
      if (!token) {
        console.error('No authentication token found');
        alert('Authentication error. Please login again.');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coordinators/approve-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Approve user API response:', data);
      
      if (data.status === 'success') {
        // Remove approved user from pending list
        setProfiles(profiles.filter(profile => profile.id !== userId));
        
        // Refresh both all users count and pending users
        await fetchAllUsers(); // Refresh statistics
        await fetchPendingUsers(); // Refresh pending list
        
        alert('User approved successfully!');
        console.log('User approved and counts refreshed');
      } else {
        console.error('Failed to approve user:', data.message);
        alert('Failed to approve user: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      console.log('Rejecting user:', userId);
      
      // Check for both coordinator_token (first login) and admin_token (after first login)
      const token = localStorage.getItem('coordinator_token') || localStorage.getItem('admin_token');
      
      if (!token) {
        console.error('No authentication token found');
        alert('Authentication error. Please login again.');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coordinators/reject-user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Reject user API response:', data);
      
      if (data.status === 'success') {
        // Remove rejected user from list
        setProfiles(profiles.filter(profile => profile.id !== userId));
        
        // Refresh both all users count and pending users
        await fetchAllUsers(); // Refresh statistics
        await fetchPendingUsers(); // Refresh pending list
        
        alert('User rejected successfully!');
        console.log('User rejected and counts refreshed');
      } else {
        console.error('Failed to reject user:', data.message);
        alert('Failed to reject user: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (userId) => {
    fetchUserDetails(userId);
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Approvals</h1>
        <p className="mt-2 text-gray-600">Review and approve alumni registration requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Pending Profiles */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Profiles</p>
              <p className="text-2xl font-bold text-yellow-900">{profileCounts.pending}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Approved Profiles */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Approved Profiles</p>
              <p className="text-2xl font-bold text-green-900">{profileCounts.approved}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Rejected Profiles */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Rejected Profiles</p>
              <p className="text-2xl font-bold text-red-900">{profileCounts.rejected}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <XMarkIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Total Profiles */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Total Profiles</p>
              <p className="text-2xl font-bold text-gray-900">{profileCounts.total}</p>
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <UserIcon className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredProfiles.length} pending {filteredProfiles.length === 1 ? 'request' : 'requests'}
            </span>
          </div>
        </div>
      </Card>

      {/* Pending Users Table */}
      <Card>
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No requests match your search criteria.' : 'All registration requests have been processed.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {profile.first_name} {profile.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{profile.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {profile.department || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {profile.contact_number || 'Not provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(profile.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(profile.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleApprove(profile.id)}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(profile.id)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                          title="Reject"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProfile(null);
        }}
        title="User Details"
      >
        {selectedProfile && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedProfile.first_name} {selectedProfile.last_name}
                </h3>
                <p className="text-sm text-gray-500">{selectedProfile.email}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">PRN Number</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedProfile.prn_number || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedProfile.department || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Passout Year</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedProfile.passout_year || 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedProfile.contact_number || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {selectedProfile.role}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedProfile.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProfile(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleReject(selectedProfile.id);
                  setShowDetailModal(false);
                  setSelectedProfile(null);
                }}
                disabled={actionLoading}
              >
                Reject
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  handleApprove(selectedProfile.id);
                  setShowDetailModal(false);
                  setSelectedProfile(null);
                }}
                disabled={actionLoading}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfileApproval;
