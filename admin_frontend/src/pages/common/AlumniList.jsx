import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  UserIcon,
  UserGroupIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  UserPlusIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';

const AlumniList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'suspend', 'delete', 'activate'
  const [selectedAlumniForAction, setSelectedAlumniForAction] = useState(null);
  const [addMethod, setAddMethod] = useState(''); // 'single' or 'bulk'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data for single alumni addition
  const [singleAlumni, setSingleAlumni] = useState({
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    graduationYear: '',
    prnNumber: ''
  });

  // Form data for editing alumni
  const [editAlumni, setEditAlumni] = useState({
    id: '',
    firstName: '',
    lastName: '',
    department: '',
    graduationYear: '',
    prnNumber: ''
  });

  // File upload for bulk addition
  const [bulkFile, setBulkFile] = useState(null);

  // Alumni data from backend
  const [alumni, setAlumni] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });

  // Fetch alumni data from backend
  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      // Try to get alumni with is_approved field - use different endpoints based on role
      let apiUrl;
      if (user?.role === 'coordinator') {
        // For coordinators, get all users in their department
        apiUrl = `${import.meta.env.VITE_API_URL}/coordinators/all-users`;
      } else {
        // For admins, get all alumni
        apiUrl = `${import.meta.env.VITE_API_URL}/admin/alumni`;
      }
      
      console.log('Fetching alumni from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Alumni API response:', data);
        
        // Handle different response structures
        let allAlumni = [];
        if (data.data) {
          allAlumni = data.data.filter(user => user.role === 'alumni');
        } else if (data.alumni) {
          allAlumni = data.alumni;
        }
        
        // Filter to show only approved alumni
        const approvedAlumni = allAlumni.filter(alumni => alumni.is_approved === true);
        
        console.log('All alumni:', allAlumni.length);
        console.log('Approved alumni:', approvedAlumni.length);
        console.log('Approved alumni data:', approvedAlumni);
        
        setAlumni(approvedAlumni);
        
        // Update stats based on approved alumni only
        const stats = {
          total: approvedAlumni.length,
          active: approvedAlumni.filter(a => a.status === 'active').length,
          inactive: approvedAlumni.filter(a => a.status === 'inactive').length,
          suspended: approvedAlumni.filter(a => a.status === 'suspended').length
        };
        setStats(stats);
      } else {
        throw new Error('Failed to fetch alumni data');
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
      setError('Failed to load alumni data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = alumnus.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || alumnus.department === filterDepartment;
    const matchesYear = filterYear === 'all' || alumnus.graduation_year?.toString() === filterYear;
    const matchesStatus = filterStatus === 'all' || alumnus.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesYear && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-orange-100 text-orange-800'
    };
    return badges[status] || badges.active;
  };

  const openAlumniDetail = (alumnus) => {
    setSelectedAlumni(alumnus);
    setShowDetailModal(true);
  };

  const handleAddAlumni = () => {
    if (user?.role !== 'admin') {
      setError('Only administrators can add alumni');
      return;
    }
    setShowAddModal(true);
  };

  const openEditModal = (alumnus) => {
    if (user?.role !== 'admin' && user?.role !== 'coordinator') {
      setError('Only administrators and coordinators can edit alumni');
      return;
    }
    setEditAlumni({
      id: alumnus.id,
      firstName: alumnus.first_name,
      lastName: alumnus.last_name,
      department: alumnus.department,
      graduationYear: alumnus.graduation_year,
      prnNumber: alumnus.prn_number
    });
    setShowEditModal(true);
  };

  const openActionModal = (alumnus, type) => {
    if (user?.role !== 'admin') {
      setError('Only administrators can perform this action');
      return;
    }
    setSelectedAlumniForAction(alumnus);
    setActionType(type);
    setShowActionModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/alumni/${editAlumni.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: editAlumni.firstName,
          last_name: editAlumni.lastName,
          department: editAlumni.department,
          graduation_year: editAlumni.graduationYear,
          prn_number: editAlumni.prnNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Alumni updated successfully!');
        fetchAlumni();
        setTimeout(() => {
          setShowEditModal(false);
          setSuccess('');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to update alumni');
      }
    } catch (error) {
      console.error('Error updating alumni:', error);
      setError(error.message || 'Failed to update alumni');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      let url, method, successMessage;

      switch (actionType) {
        case 'suspend':
          url = `${import.meta.env.VITE_API_URL}/admin/alumni/${selectedAlumniForAction.id}/suspend`;
          method = 'PUT';
          successMessage = 'Alumni suspended successfully!';
          break;
        case 'activate':
          url = `${import.meta.env.VITE_API_URL}/admin/alumni/${selectedAlumniForAction.id}/activate`;
          method = 'PUT';
          successMessage = 'Alumni activated successfully!';
          break;
        case 'delete':
          url = `${import.meta.env.VITE_API_URL}/admin/alumni/${selectedAlumniForAction.id}`;
          method = 'DELETE';
          successMessage = 'Alumni deleted successfully!';
          break;
        default:
          throw new Error('Invalid action');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(successMessage);
        fetchAlumni();
        setTimeout(() => {
          setShowActionModal(false);
          setSuccess('');
        }, 2000);
      } else {
        throw new Error(data.message || `Failed to ${actionType} alumni`);
      }
    } catch (error) {
      console.error(`Error ${actionType} alumni:`, error);
      setError(error.message || `Failed to ${actionType} alumni`);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/alumni/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(singleAlumni)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Alumni ${singleAlumni.firstName} ${singleAlumni.lastName} added successfully! Email sent with login credentials.`);
        setSingleAlumni({
          firstName: '',
          lastName: '',
          department: '',
          email: '',
          graduationYear: '',
          prnNumber: ''
        });
        fetchAlumni();
        setTimeout(() => {
          setShowAddModal(false);
          setSuccess('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to add alumni');
      }
    } catch (error) {
      console.error('Error adding alumni:', error);
      setError(error.message || 'Failed to add alumni');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      setError('Please select a file to upload');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('file', bulkFile);

      // Add delay parameter to backend
      formData.append('delayEmails', 'true');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/alumni/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully uploaded ${data.count} alumni! Emails are being sent with 2-second delays to prevent server overload.`);
        setBulkFile(null);
        fetchAlumni();
        setTimeout(() => {
          setShowAddModal(false);
          setSuccess('');
        }, 2000); // Increased time to show the delay message
      } else {
        throw new Error(data.message || 'Failed to upload alumni');
      }
    } catch (error) {
      console.error('Error uploading alumni:', error);
      setError(error.message || 'Failed to upload alumni');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template
    const headers = ['First Name', 'Last Name', 'Department', 'Email', 'Graduation Year', 'PRN Number'];
    const csvContent = headers.join(',') + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alumni_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: 'Alumni Info',
      key: 'name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.first_name} {row.last_name}
            </div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Academic',
      key: 'department',
      accessor: (row) => (
        <div>
          <div className="text-sm font-medium">{row.department}</div>
          <div className="text-sm text-gray-500">Class of {row.graduation_year}</div>
          <div className="text-sm text-gray-500">PRN: {row.prn_number}</div>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      accessor: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Approve',
      key: 'approve',
      accessor: (row) => (
        <div className="text-sm">
          {row.is_approved === true ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Approved
            </span>
          ) : (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Pending
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Registered',
      key: 'created_at',
      accessor: (row) => (
        <div className="text-sm">
          {new Date(row.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openAlumniDetail(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {(user?.role === 'admin' || user?.role === 'coordinator') && (
            <button
              onClick={() => openEditModal(row)}
              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
              title="Edit Alumni"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => openActionModal(row, 'suspend')}
                className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                title="Suspend Alumni"
              >
                <PauseIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => openActionModal(row, 'delete')}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Delete Alumni"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alumni List</h1>
          <p className="text-gray-600">Manage registered alumni users</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <Button onClick={handleAddAlumni} className="flex items-center gap-2">
              <UserPlusIcon className="w-4 h-4" />
              Add Alumni
            </Button>
          )}
          <Button variant="secondary" className="flex items-center gap-2">
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export Alumni Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alumni</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active || 0}</p>
            </div>
            <UserIcon className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive || 0}</p>
            </div>
            <UserIcon className="w-8 h-8 text-red-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-orange-600">{stats.suspended || 0}</p>
            </div>
            <PauseIcon className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search alumni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Telecommunication Engineering">Electronics & Telecommunication Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
            <option value="Electronics Engineering (VLSI Design And Technology)">Electronics Engineering (VLSI Design And Technology)</option>
            <option value="Electronics & Communication (Advanced Communication Technology)">Electronics & Communication (Advanced Communication Technology)</option>
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Alumni Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredAlumni}
          loading={loading}
          emptyMessage="No alumni found"
        />
      </Card>

      {/* Add Alumni Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddMethod('');
          setError('');
          setSuccess('');
        }}
        title="Add Alumni"
        size="lg"
      >
        {!addMethod ? (
          <div className="space-y-4">
            <p className="text-gray-600">Choose how you want to add alumni:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setAddMethod('single')}
                className="flex items-center justify-center gap-2 p-6 h-auto"
              >
                <UserPlusIcon className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Add Single Alumni</div>
                  <div className="text-sm opacity-75">Add one alumni at a time</div>
                </div>
              </Button>
              <Button
                variant="secondary"
                onClick={() => setAddMethod('bulk')}
                className="flex items-center justify-center gap-2 p-6 h-auto"
              >
                <DocumentArrowDownIcon className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Bulk Upload</div>
                  <div className="text-sm opacity-75">Upload CSV file with multiple alumni</div>
                </div>
              </Button>
            </div>
            <div className="flex justify-center">
              <Button variant="secondary" onClick={downloadTemplate}>
                Download Template
              </Button>
            </div>
          </div>
        ) : addMethod === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  type="text"
                  required
                  value={singleAlumni.firstName}
                  onChange={(e) => setSingleAlumni({ ...singleAlumni, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  type="text"
                  required
                  value={singleAlumni.lastName}
                  onChange={(e) => setSingleAlumni({ ...singleAlumni, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  required
                  value={singleAlumni.email}
                  onChange={(e) => setSingleAlumni({ ...singleAlumni, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={singleAlumni.department}
                  onChange={(e) => setSingleAlumni({ ...singleAlumni, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="Civil Engineering">Civil Engineering</option>
<option value="Computer Engineering">Computer Engineering</option>
<option value="Information Technology">Information Technology</option>
<option value="Electronics & Telecommunication Engineering">Electronics & Telecommunication Engineering</option>
<option value="Mechanical Engineering">Mechanical Engineering</option>
<option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
<option value="Electronics Engineering (VLSI Design And Technology)">Electronics Engineering (VLSI Design And Technology)</option>
<option value="Electronics & Communication (Advanced Communication Technology)">Electronics & Communication (Advanced Communication Technology)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Graduation Year *
                </label>
                <Input
                  type="number"
                  required
                  min="2000"
                  max={new Date().getFullYear()}
                  value={singleAlumni.graduationYear}
                  onChange={(e) => setSingleAlumni({ ...singleAlumni, graduationYear: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PRN Number *
                </label>
                <Input
                  type="text"
                  required
                  value={singleAlumni.prnNumber}
                  onChange={(e) => setSingleAlumni({ ...singleAlumni, prnNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAddMethod('')}
              >
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Alumni'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBulkUpload} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload CSV File *
              </label>
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => setBulkFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                CSV should contain: First Name, Last Name, Department, Email, Graduation Year, PRN Number
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAddMethod('')}
              >
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Alumni'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Alumni Detail Modal */}
      <Modal
        isOpen={showDetailModal && selectedAlumni}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedAlumni(null);
        }}
        title="Alumni Details"
        size="lg"
      >
        {selectedAlumni && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedAlumni.first_name} {selectedAlumni.last_name}
                </h3>
                <p className="text-gray-500">{selectedAlumni.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedAlumni.status)}`}>
                    {selectedAlumni.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Academic Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Department:</span>
                  <span className="ml-2 font-medium">{selectedAlumni.department}</span>
                </div>
                <div>
                  <span className="text-gray-500">Graduation Year:</span>
                  <span className="ml-2 font-medium">{selectedAlumni.graduation_year}</span>
                </div>
                <div>
                  <span className="text-gray-500">PRN Number:</span>
                  <span className="ml-2 font-medium">{selectedAlumni.prn_number}</span>
                </div>
                <div>
                  <span className="text-gray-500">Registered:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedAlumni.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Alumni Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setError('');
          setSuccess('');
        }}
        title="Edit Alumni"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <Input
                type="text"
                required
                value={editAlumni.firstName}
                onChange={(e) => setEditAlumni({ ...editAlumni, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <Input
                type="text"
                required
                value={editAlumni.lastName}
                onChange={(e) => setEditAlumni({ ...editAlumni, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                required
                value={editAlumni.department}
                onChange={(e) => setEditAlumni({ ...editAlumni, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Telecommunication Engineering">Electronics & Telecommunication Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Electronics Engineering (VLSI Design And Technology)">Electronics Engineering (VLSI Design And Technology)</option>
                <option value="Electronics & Communication (Advanced Communication Technology)">Electronics & Communication (Advanced Communication Technology)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graduation Year *
              </label>
              <Input
                type="number"
                required
                value={editAlumni.graduationYear}
                onChange={(e) => setEditAlumni({ ...editAlumni, graduationYear: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PRN Number *
              </label>
              <Input
                type="text"
                required
                value={editAlumni.prnNumber}
                onChange={(e) => setEditAlumni({ ...editAlumni, prnNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Alumni'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Action Modal (Suspend/Activate/Delete) */}
      <Modal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setError('');
          setSuccess('');
        }}
        title={actionType === 'delete' ? 'Delete Alumni' : actionType === 'suspend' ? 'Suspend Alumni' : 'Activate Alumni'}
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
          
          <div className="text-center">
            {actionType === 'delete' ? (
              <>
                <TrashIcon className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete {selectedAlumniForAction?.first_name} {selectedAlumniForAction?.last_name}?
                </h3>
                <p className="text-gray-600 mb-4">
                  This action cannot be undone. All data associated with this alumni will be permanently deleted.
                </p>
              </>
            ) : actionType === 'suspend' ? (
              <>
                <PauseIcon className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Suspend {selectedAlumniForAction?.first_name} {selectedAlumniForAction?.last_name}?
                </h3>
                <p className="text-gray-600 mb-4">
                  This alumni will not be able to access their account until you activate them again.
                </p>
              </>
            ) : (
              <>
                <PlayIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Activate {selectedAlumniForAction?.first_name} {selectedAlumniForAction?.last_name}?
                </h3>
                <p className="text-gray-600 mb-4">
                  This alumni will regain full access to their account.
                </p>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowActionModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleAction}
              disabled={loading}
              className={actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : actionType === 'suspend' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {loading ? 'Processing...' : actionType === 'delete' ? 'Delete Alumni' : actionType === 'suspend' ? 'Suspend Alumni' : 'Activate Alumni'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlumniList;
