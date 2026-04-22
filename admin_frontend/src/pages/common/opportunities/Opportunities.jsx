import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  XMarkIcon,
  EyeIcon,
  UserGroupIcon,
  UserIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { useAuth } from '../../../context/AuthContext';

const Opportunities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [viewingOpportunity, setViewingOpportunity] = useState(null);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [applicationsData, setApplicationsData] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState(false);

  // Debug: Monitor applicationsData changes
  React.useEffect(() => {
   
  }, [applicationsData, applicationsLoading, showApplicationsModal]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPostedBy, setFilterPostedBy] = useState('all');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch applications for an opportunity
  const fetchApplications = async (opportunityId) => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/${opportunityId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch applications (${response.status})`);
      }
      
      const data = await response.json();
      console.log('🔧 Applications data:', data);
      console.log('🔧 Applications data keys:', Object.keys(data));
      
      // Try different possible response structures
      const applications = data.data || data.applications || data || [];
      console.log('🔧 Applications array:', applications);
      console.log('🔧 Applications length:', applications.length);
      
      if (applications.length > 0) {
        console.log('🔧 First application object keys:', Object.keys(applications[0]));
        console.log('🔧 First application full data:', applications[0]);
        console.log('🔧 User details in application:', {
          first_name: applications[0].first_name,
          last_name: applications[0].last_name,
          email: applications[0].email,
          department: applications[0].department,
          passout_year: applications[0].passout_year,
          contact_number: applications[0].contact_number,
          proposal: applications[0].proposal
        });
      }
      
      setApplicationsData(applications);
     
      
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplicationsData([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Handle applications button click
  const handleApplicationsClick = (opportunity) => {
    console.log('🔧 handleApplicationsClick called with opportunity:', opportunity);
    console.log('🔧 Opportunity ID:', opportunity.id);
    console.log('🔧 Opportunity title:', opportunity.title);
    console.log('🔧 Applications count from opportunity:', opportunity.applications_count);
    
    setViewingOpportunity(opportunity);
    setShowApplicationsModal(true);
    fetchApplications(opportunity.id);
  };

  // Handle view application details
  const handleViewApplication = (application) => {
    console.log('🔧 handleViewApplication called with application:', application);
    setSelectedApplication(application);
    setShowApplicationDetailsModal(true);
  };

  // Check if current user is the owner of the opportunity
  const isOwner = (opportunity) => {
    if (!user || !opportunity) {
      console.log('🔧 isOwner: missing user or opportunity', { user: !!user, opportunity: !!opportunity });
      return false;
    }
    const isOwnerResult = opportunity.author_id === user.id;
    console.log('🔧 isOwner check:', {
      opportunityAuthorId: opportunity.author_id,
      currentUserId: user.id,
      isOwnerResult,
      opportunityKeys: Object.keys(opportunity)
    });
    return isOwnerResult;
  };

  // Handle application status update
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      console.log(`🔧 handleUpdateStatus called:`, { applicationId, newStatus });
      
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      console.log(`🔧 Token available:`, !!token);
      
      const requestBody = { status: newStatus };
      console.log(`🔧 Request body:`, requestBody);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`🔧 Response status:`, response.status);
      console.log(`🔧 Response ok:`, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(`🔧 Error response:`, errorData);
        throw new Error(errorData.message || `Failed to update status (${response.status})`);
      }

      const responseData = await response.json();
      console.log(`🔧 Success response:`, responseData);

      // Refresh the applications list
      if (viewingOpportunity) {
        console.log(`🔧 Refreshing applications for opportunity:`, viewingOpportunity.id);
        fetchApplications(viewingOpportunity.id);
      }

      console.log(`🔧 Application ${applicationId} status updated to: ${newStatus}`);
    } catch (err) {
      console.error('❌ Error updating application status:', err);
      alert(`Failed to update application status: ${err.message}`);
    }
  };

  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: '',
    location: '',
    salary_range: '',
    experience_range: '',
    deadline: '',
    skills: '',
    description: ''
  });

  const opportunityTypes = ['Job', 'Internship', 'Freelance', 'Volunteer'];
  const experienceRanges = ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      if (!token) {
        setError('Please login to view opportunities');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch opportunities');
      
      const data = await response.json();
      setOpportunities(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      const opportunityData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        author_id: user.id,
        author_role: user.role
      };

      const url = editingOpportunity 
        ? `${import.meta.env.VITE_API_URL}/opportunities/${editingOpportunity.id}`
        : `${import.meta.env.VITE_API_URL}/opportunities`;
      
      const method = editingOpportunity ? 'PUT' : 'POST';

      console.log(`🔧 ${editingOpportunity ? 'Updating' : 'Creating'} new opportunity...`);
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(opportunityData)
      });

      console.log(`🔧 Opportunity ${editingOpportunity ? 'update' : 'creation'} response status: ${response.status}`);

      if (!response.ok) throw new Error('Failed to save opportunity');

      const data = await response.json();
      console.log('🔧 Opportunity result:', data);
      setSuccess(data.message);
      setShowAddModal(false);
      setEditingOpportunity(null);
      resetForm();
      fetchOpportunities();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (opportunityId) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/${opportunityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete opportunity');

      setSuccess('Opportunity deleted successfully');
      fetchOpportunities();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      type: '',
      location: '',
      salary_range: '',
      experience_range: '',
      deadline: '',
      skills: '',
      description: ''
    });
  };

  const openEditModal = (opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      title: opportunity.title,
      company: opportunity.company,
      type: opportunity.type,
      location: opportunity.location,
      salary_range: opportunity.salary_range,
      experience_range: opportunity.experience_range,
      deadline: opportunity.deadline ? new Date(opportunity.deadline).toISOString().split('T')[0] : '',
      skills: opportunity.skills ? opportunity.skills.join(', ') : '',
      description: opportunity.description
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingOpportunity(null);
    resetForm();
  };

  const openViewModal = (opportunity) => {
    setViewingOpportunity(opportunity);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingOpportunity(null);
  };

  const canEditOpportunity = (opportunity) => {
    return user && (opportunity.author_id === user.id || user.role === 'admin' || user.role === 'Admin');
  };

  const canDeleteOpportunity = (opportunity) => {
    return user && (opportunity.author_id === user.id || user.role === 'admin' || user.role === 'Admin');
  };

  const handleEditClick = (opportunity) => {
    if (canEditOpportunity(opportunity)) {
      openEditModal(opportunity);
    } else {
      alert('You can only edit opportunities that you have posted.');
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || opportunity.type === filterType;
    const matchesStatus = filterStatus === 'all' || (opportunity.status || 'active') === filterStatus;
    const matchesPostedBy = filterPostedBy === 'all' || opportunity.author_role === filterPostedBy;
    return matchesSearch && matchesType && matchesStatus && matchesPostedBy;
  });

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
        {status || 'active'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Opportunities Management</h1>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Opportunity
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {opportunityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filterPostedBy}
              onChange={(e) => setFilterPostedBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Posted By (All)</option>
              <option value="admin">Admin</option>
              <option value="coordinator">Coordinator</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by creating your first opportunity'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Opportunity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Deadline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Applications
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Posted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Posted By
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOpportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {opportunity.title}
                        </div>
                        <div className="text-gray-500 text-xs flex items-center mt-1">
                          <BriefcaseIcon className="h-3 w-3 mr-1" />
                          {opportunity.type}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm space-y-1">
                        <div className="text-gray-900 font-medium">{opportunity.company}</div>
                        <div className="flex items-center text-gray-900">
                          <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" />
                          {opportunity.location || 'Remote'}
                        </div>
                        <div className="flex items-center text-gray-900">
                          <CurrencyDollarIcon className="h-3 w-3 mr-1 text-gray-400" />
                          {opportunity.salary_range || 'Not specified'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {opportunity.deadline 
                          ? new Date(opportunity.deadline).toLocaleDateString()
                          : 'No deadline'
                        }
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleApplicationsClick(opportunity)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <UserGroupIcon className="h-3 w-3 mr-1" />
                        {opportunity.author_id === user?.id ? 'Manage' : 'Applications'} ({opportunity.applications_count || 0})
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(opportunity.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(opportunity.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium truncate max-w-24">
                          {opportunity.author_name || 'Unknown'}
                        </div>
                        <div className="text-gray-500 text-xs truncate max-w-24">
                          {opportunity.author_department || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {opportunity.author_role}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-1">
                        {canEditOpportunity(opportunity) && (
                          <button
                            onClick={() => handleEditClick(opportunity)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                            title="Edit Opportunity"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openViewModal(opportunity)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {canDeleteOpportunity(opportunity) && (
                          <button
                            onClick={() => handleDelete(opportunity.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Delete Opportunity"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={showAddModal}
        onClose={closeModal}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
              </h2>
              <Button variant="outline" size="sm" onClick={closeModal}>
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Enter job title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Company *</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    required
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    {opportunityTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Salary Range *</label>
                  <Input
                    value={formData.salary_range}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_range: e.target.value }))}
                    required
                    placeholder="e.g., ₹10-15 LPA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Experience Range</label>
                  <select
                    value={formData.experience_range}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_range: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select experience</option>
                    {experienceRanges.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Last Date to Apply</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Skills</label>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="e.g., JavaScript, React, Node.js (comma separated)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter job description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOpportunity ? 'Update Opportunity' : 'Create Opportunity'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

      {/* View Modal */}
      <Modal 
        isOpen={showViewModal}
        onClose={closeViewModal}>
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Opportunity Details</h2>
              <Button variant="outline" size="sm" onClick={closeViewModal}>
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            {viewingOpportunity && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {viewingOpportunity.title}
                      </h3>
                      <div className="text-lg text-gray-600 mb-2">
                        {viewingOpportunity.company}
                      </div>
                      {getStatusBadge(viewingOpportunity.status)}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Posted on</div>
                      <div className="text-sm font-medium">
                        {new Date(viewingOpportunity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Job Type</div>
                      <div className="flex items-center text-sm text-gray-900">
                        <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {viewingOpportunity.type}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Location</div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {viewingOpportunity.location || 'Remote'}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Salary Range</div>
                      <div className="flex items-center text-sm text-gray-900">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {viewingOpportunity.salary_range || 'Not specified'}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Experience Required</div>
                      <div className="text-sm text-gray-900">
                        {viewingOpportunity.experience_range || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Last Date to Apply</div>
                      <div className="flex items-center text-sm text-gray-900">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {viewingOpportunity.deadline 
                          ? new Date(viewingOpportunity.deadline).toLocaleDateString()
                          : 'No deadline'
                        }
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Applications</div>
                      <button
                        onClick={() => handleApplicationsClick(viewingOpportunity)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                      >
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        {viewingOpportunity.applications_count || 0} applications
                      </button>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Posted By</div>
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {viewingOpportunity.author_name || 'Unknown'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {viewingOpportunity.author_department || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {viewingOpportunity.author_role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {viewingOpportunity.description || 'No description provided'}
                  </div>
                </div>

                {/* Skills */}
                {viewingOpportunity.skills && viewingOpportunity.skills.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Required Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {viewingOpportunity.skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded text-sm bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {canEditOpportunity(viewingOpportunity) && (
                    <Button 
                      onClick={() => {
                        closeViewModal();
                        openEditModal(viewingOpportunity);
                      }}
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Opportunity
                    </Button>
                  )}
                  <Button variant="outline" onClick={closeViewModal}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Applications Modal */}
        <Modal 
          isOpen={showApplicationsModal} 
          onClose={() => setShowApplicationsModal(false)}
          title="Applications"
          size="xl"
        >
          {viewingOpportunity && (
            <div className="space-y-6">
              {/* Opportunity Header */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {viewingOpportunity.title}
                </h3>
                <div className="flex items-center text-gray-600">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">{viewingOpportunity.company}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {applicationsData.length} application(s) received
                </div>
              </div>

              {/* Applications List */}
              {applicationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              ) : applicationsData.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No applications received yet</p>
                  <div className="mt-2 text-xs text-gray-400">
                    Debug: applicationsData = {JSON.stringify(applicationsData)}
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                            Department
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                            Passout
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Contact
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                            Resume
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                            Status
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {applicationsData.map((application) => (
                          <tr key={application.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                                  <UserIcon className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {application.first_name || 'Unknown'} {application.last_name || 'User'}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900 truncate" title={application.email || 'N/A'}>
                                {application.email || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900 truncate" title={application.department || 'N/A'}>
                                {application.department || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {application.passout_year || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {application.contact_number || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {application.resume_url ? (
                                <a
                                  href={application.resume_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm"
                                  title="Download Resume"
                                >
                                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                                  Resume
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">No resume</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                application.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                                application.status === 'shortlisted' ? 'bg-purple-100 text-purple-800' :
                                application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {application.status === 'under_review' ? 'Under Review' : (application.status || 'pending')}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {/* View button - always show */}
                                <button
                                  onClick={() => handleViewApplication(application)}
                                  className="text-blue-600 hover:text-blue-900 inline-flex items-center justify-center"
                                  title="View Application Details"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                
                                {/* Status management buttons - only show for owners */}
                                {isOwner(viewingOpportunity) && (
                                  <>
                                    {application.status === 'pending' && (
                                      <button
                                        onClick={() => handleUpdateStatus(application.id, 'under_review')}
                                        className="text-blue-600 hover:text-blue-900 inline-flex items-center text-xs"
                                        title="Mark as Reviewed"
                                      >
                                        Review
                                      </button>
                                    )}
                                    {(application.status === 'pending' || application.status === 'under_review') && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateStatus(application.id, 'accepted')}
                                          className="text-green-600 hover:text-green-900 inline-flex items-center text-xs"
                                          title="Accept Application"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                          className="text-red-600 hover:text-red-900 inline-flex items-center text-xs"
                                          title="Reject Application"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Application Details Modal */}
        <Modal 
          isOpen={showApplicationDetailsModal} 
          onClose={() => setShowApplicationDetailsModal(false)}
          title="Application Details"
          size="lg"
        >
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Header */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedApplication.first_name || 'Unknown'} {selectedApplication.last_name || 'User'}
                    </h3>
                    <p className="text-sm text-gray-500">Applicant</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <p className="text-sm text-gray-900">{selectedApplication.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Contact Number:</span>
                      <p className="text-sm text-gray-900">{selectedApplication.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Department:</span>
                      <p className="text-sm text-gray-900">{selectedApplication.department || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Passout Year:</span>
                      <p className="text-sm text-gray-900">{selectedApplication.passout_year || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Application Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Application Status:</span>
                      <div className="mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedApplication.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          selectedApplication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedApplication.status || 'pending'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Applied Date:</span>
                      <p className="text-sm text-gray-900">
                        {selectedApplication.applied_date ? 
                          new Date(selectedApplication.applied_date).toLocaleDateString() : 
                          'N/A'
                        }
                      </p>
                    </div>
                    {selectedApplication.resume_url && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Resume:</span>
                        <p className="text-sm text-gray-900">
                          <a 
                            href={selectedApplication.resume_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View Resume
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Proposal */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Proposal</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedApplication.proposal || 'No proposal provided'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowApplicationDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
    </div>
  );
};

export default Opportunities;
