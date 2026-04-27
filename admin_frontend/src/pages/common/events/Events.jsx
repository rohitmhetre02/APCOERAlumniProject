import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
  ClockIcon,
  XMarkIcon,
  UserGroupIcon,
  MicrophoneIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { useAuth } from '../../../context/AuthContext';

// Backend Cloudinary Upload
const uploadImageToCloudinary = async (file) => {
  try {
    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    
    const base64Data = await base64Promise;
    
    // Get auth token
    const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
    
    // Upload via backend
    const response = await fetch(`${import.meta.env.VITE_API_URL}/events/upload-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        image: base64Data
      })
    });
    
    console.log('📤 Upload request sent, status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload request failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('📡 Upload response:', data);
    
    if (data.success && data.url) {
      console.log('✅ Upload successful:', data.url);
      return data.url;
    } else {
      console.error('❌ Upload failed:', data);
      throw new Error(data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

const Events = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [registrationsData, setRegistrationsData] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPostedBy, setFilterPostedBy] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    event_mode: 'offline',
    capacity: '',
    event_type: 'Workshop',
    custom_event_type: '',
    image_url: '',
    guest_speakers: [
      { name: '', topic: '', role: '' }
    ]
  });

  const eventTypes = ['Workshop', 'Networking', 'Educational', 'Social', 'Showcase', 'other'];
  const eventModes = ['online', 'offline', 'hybrid'];

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('admin_token');
      const coordinatorToken = localStorage.getItem('coordinator_token');
      const userRole = localStorage.getItem('userRole');
      
      // Use admin token first, fallback to coordinator token
      const token = adminToken || coordinatorToken;
      const status = filterStatus === 'all' ? '' : filterStatus;
      
      console.log('🔑 Token Debug:', {
        adminToken: !!adminToken,
        coordinatorToken: !!coordinatorToken,
        finalToken: !!token,
        tokenLength: token ? token.length : 0,
        userRole: userRole
      });
      
      // If no token found, show error
      if (!token) {
        setError('Please login to access events');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events${status ? `?status=${status}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ Events fetched successfully:', data.data?.length || 0, 'events');
      setEvents(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterStatus]);

  // Fetch event registrations for an event
  const fetchEventRegistrations = async (eventId) => {
    try {
      setRegistrationsLoading(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch registrations (${response.status})`);
      }
      
      const data = await response.json();
      setRegistrationsData(data.data || []);
      
    } catch (err) {
      console.error('Error fetching event registrations:', err);
      setRegistrationsData([]);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  // Handle registrations button click
  const handleRegistrationsClick = (event) => {
    setViewingEvent(event);
    setShowRegistrationsModal(true);
    fetchEventRegistrations(event.id);
  };

  // Download registrations as PDF
  const downloadRegistrationsPDF = () => {
    if (!viewingEvent || registrationsData.length === 0) return;

    // Create HTML content for PDF
    const htmlContent = `
      <html>
        <head>
          <title>Event Registrations - ${viewingEvent.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 15px; font-size: 12px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 8px; font-size: 18px; margin-bottom: 15px; }
            h2 { color: #333; font-size: 16px; margin-bottom: 10px; }
            .event-info { margin: 15px 0; padding: 12px; background: #f5f5f5; border-radius: 5px; font-size: 11px; }
            .event-info p { margin: 3px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; }
            th, td { border: 1px solid #ddd; padding: 6px 4px; text-align: left; vertical-align: top; }
            th { background-color: #f2f2f2; font-weight: bold; font-size: 10px; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .status { padding: 2px 4px; border-radius: 2px; color: white; font-size: 9px; display: inline-block; }
            .status.registered { background-color: #28a745; }
            .footer { margin-top: 20px; font-size: 9px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Event Registrations Report</h1>
          
          <div class="event-info">
            <h2>${viewingEvent.title}</h2>
            <p><strong>Date:</strong> ${new Date(viewingEvent.event_date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${viewingEvent.event_time || 'N/A'}</p>
            <p><strong>Location:</strong> ${viewingEvent.location || 'N/A'}</p>
            <p><strong>Mode:</strong> ${viewingEvent.event_mode || 'N/A'}</p>
            <p><strong>Guest Speakers:</strong> ${
              viewingEvent.guest_speakers && viewingEvent.guest_speakers.length > 0 
                ? viewingEvent.guest_speakers.map(speaker => speaker.name).join(', ')
                : 'No Guest Speakers'
            }</p>
            <p><strong>Total Registrations:</strong> ${registrationsData.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">Sr No.</th>
                <th style="width: 15%;">Name</th>
                <th style="width: 20%;">Email</th>
                <th style="width: 15%;">Department</th>
                <th style="width: 10%;">Passout Year</th>
                <th style="width: 15%;">Contact Number</th>
                <th style="width: 20%;">Registration Status</th>
              </tr>
            </thead>
            <tbody>
              ${registrationsData.map((reg, index) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td>${reg.first_name || 'Unknown'} ${reg.last_name || 'User'}</td>
                  <td>${reg.email || 'N/A'}</td>
                  <td>${reg.department || 'N/A'}</td>
                  <td style="text-align: center;">${reg.passout_year || 'N/A'}</td>
                  <td>${reg.contact_number || 'N/A'}</td>
                  <td style="text-align: center;"><span class="status registered">${reg.status || 'Registered'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Generated on ${new Date().toLocaleString()} for ${viewingEvent.title}
          </div>
        </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = function() {
      printWindow.print();
      printWindow.close();
    };
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle guest speaker changes
  const handleGuestSpeakerChange = (index, field, value) => {
    const updatedSpeakers = [...formData.guest_speakers];
    updatedSpeakers[index][field] = value;
    setFormData(prev => ({
      ...prev,
      guest_speakers: updatedSpeakers
    }));
  };

  // Add guest speaker
  const addGuestSpeaker = () => {
    if (formData.guest_speakers.length < 4) {
      setFormData(prev => ({
        ...prev,
        guest_speakers: [...prev.guest_speakers, { name: '', topic: '', role: '' }]
      }));
    }
  };

  // Remove guest speaker
  const removeGuestSpeaker = (index) => {
    const updatedSpeakers = formData.guest_speakers.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      guest_speakers: updatedSpeakers.length > 0 ? updatedSpeakers : [{ name: '', topic: '', role: '' }]
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        setError('');
        
        // Upload directly to Cloudinary
        const imageUrl = await uploadImageToCloudinary(file);
        
        if (imageUrl) {
          setFormData(prev => ({
            ...prev,
            image_url: imageUrl
          }));
          setSuccess('Image uploaded successfully');
        } else {
          setError('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setError('Error uploading image: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Submit event
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      // Filter out empty guest speakers
      const validGuestSpeakers = formData.guest_speakers.filter(
        speaker => speaker.name.trim() && speaker.topic.trim() && speaker.role.trim()
      );

      const eventData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        guest_speakers: validGuestSpeakers
      };

      console.log('🔧 Creating new event...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      console.log(`🔧 Event creation response status: ${response.status}`);

      if (!response.ok) throw new Error('Failed to create event');

      const data = await response.json();
      console.log('🔧 Event creation result:', data);
      setSuccess(data.message);
      setShowAddModal(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      event_mode: 'offline',
      capacity: '',
      event_type: 'Workshop',
      custom_event_type: '',
      image_url: '',
      guest_speakers: [
        { name: '', topic: '', role: '' }
      ]
    });
    setEditingEvent(null);
  };

  const openViewModal = (event) => {
    setViewingEvent(event);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingEvent(null);
  };

  const canEditEvent = (event) => {
    return user && (event.created_by === user.id || user.role === 'admin' || user.role === 'Admin');
  };

  const canDeleteEvent = (event) => {
    return user && (event.created_by === user.id || user.role === 'admin' || user.role === 'Admin');
  };

  const handleEditClick = (event) => {
    if (canEditEvent(event)) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        event_time: event.event_time,
        location: event.location,
        event_mode: event.event_mode,
        capacity: event.capacity?.toString() || '',
        event_type: event.event_type,
        custom_event_type: event.custom_event_type || '',
        image_url: event.image_url || '',
        guest_speakers: event.guest_speakers || [
          { name: '', topic: '', role: '' }
        ]
      });
      setShowAddModal(true);
    } else {
      alert('You do not have access to edit this event. You can only edit events you have posted.');
    }
  };

  // Delete event
  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete event');

      setSuccess('Event deleted successfully');
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesPostedBy = filterPostedBy === 'all' || event.author_role === filterPostedBy;
    return matchesSearch && matchesStatus && matchesPostedBy;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600">Manage and organize events for alumni</p>
        </div>
        
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Event
          </Button>
        
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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

      {/* Events Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading events...</div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterPostedBy !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by creating your first event'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Posted By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Location & Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Registration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Posted Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {event.event_type === 'other' ? event.custom_event_type : event.event_type}
                          </div>
                          {event.guest_speakers && event.guest_speakers.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <MicrophoneIcon className="h-3 w-3" />
                              {event.guest_speakers.length} speaker{event.guest_speakers.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {event.author_name || 'Unknown'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {event.author_department || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {event.author_role}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'approved' ? 'bg-green-100 text-green-800' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3 mr-1 text-gray-400" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3 mr-1 text-gray-400" />
                          {new Date(`1970-01-01T${event.event_time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center text-gray-900">
                          <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            event.event_mode === 'online' ? 'bg-blue-100 text-blue-800' :
                            event.event_mode === 'offline' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {event.event_mode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRegistrationsClick(event)}
                        className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {event.registrations_count || 0}/{event.capacity || 'Infinity'} Registrations
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-1">
                        {canEditEvent(event) && (
                          <button
                            onClick={() => handleEditClick(event)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                            title="Edit Event"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openViewModal(event)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {canDeleteEvent(event) && (
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Delete Event"
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

      {/* Add Event Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Event"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              {formData.image_url ? (
                <div className="space-y-4">
                  <img
                    src={formData.image_url}
                    alt="Event preview"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Upload an image</span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Event Type */}
          {formData.event_type === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Event Type *
              </label>
              <Input
                name="custom_event_type"
                value={formData.custom_event_type}
                onChange={handleInputChange}
                placeholder="Enter custom event type"
                required
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your event..."
            />
          </div>

          {/* Date, Time, Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <Input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <Input
                type="time"
                name="event_time"
                value={formData.event_time}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Mode and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Mode *
              </label>
              <select
                name="event_mode"
                value={formData.event_mode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {eventModes.map(mode => (
                  <option key={mode} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity *
              </label>
              <Input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
          </div>

          {/* Guest Speakers */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Guest Speakers
              </label>
              {formData.guest_speakers.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addGuestSpeaker}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Speaker
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {formData.guest_speakers.map((speaker, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Name *"
                      value={speaker.name}
                      onChange={(e) => handleGuestSpeakerChange(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Topic *"
                      value={speaker.topic}
                      onChange={(e) => handleGuestSpeakerChange(index, 'topic', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Role *"
                        value={speaker.role}
                        onChange={(e) => handleGuestSpeakerChange(index, 'role', e.target.value)}
                        className="flex-1"
                      />
                      {formData.guest_speakers.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeGuestSpeaker(index)}
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : user?.role === 'admin' ? 'Create Event' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
              <Button variant="ghost" size="sm" onClick={closeViewModal}>
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            {viewingEvent && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {viewingEvent.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          viewingEvent.event_mode === 'online' ? 'bg-blue-100 text-blue-800' :
                          viewingEvent.event_mode === 'offline' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {viewingEvent.event_mode}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          viewingEvent.status === 'approved' ? 'bg-green-100 text-green-800' :
                          viewingEvent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {viewingEvent.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Posted on</div>
                      <div className="text-sm font-medium">
                        {new Date(viewingEvent.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image */}
                {viewingEvent.image_url && (
                  <div className="flex justify-center mb-6">
                    <img
                      src={viewingEvent.image_url}
                      alt={viewingEvent.title}
                      className="max-w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {viewingEvent.description || 'No description provided'}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Event Type</div>
                      <div className="text-sm text-gray-900">
                        {viewingEvent.event_type === 'other' ? viewingEvent.custom_event_type : viewingEvent.event_type}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Date & Time</div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {viewingEvent.event_date}
                        </div>
                        <div className="flex items-center text-sm text-gray-900">
                          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {viewingEvent.event_time}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Location</div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {viewingEvent.location}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Capacity</div>
                      <div className="flex items-center text-sm text-gray-900">
                        <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {viewingEvent.capacity} attendees
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Posted By</div>
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {viewingEvent.author_name || 'Unknown'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {viewingEvent.author_department || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {viewingEvent.author_role}
                        </div>
                      </div>
                    </div>

                    {viewingEvent.guest_speakers && viewingEvent.guest_speakers.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Guest Speakers</div>
                        <div className="space-y-2">
                          {viewingEvent.guest_speakers.map((speaker, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium text-gray-900">{speaker.name}</div>
                              <div className="text-gray-500">{speaker.topic}</div>
                              <div className="text-xs text-gray-400">{speaker.role}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {canEditEvent(viewingEvent) && (
                    <Button 
                      onClick={() => {
                        closeViewModal();
                        handleEditClick(viewingEvent);
                      }}
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Event
                    </Button>
                  )}
                  <Button variant="outline" onClick={closeViewModal}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Registrations Modal */}
      <Modal 
        isOpen={showRegistrationsModal} 
        onClose={() => setShowRegistrationsModal(false)}
        title="Event Registrations"
        size="xl"
      >
        {viewingEvent && (
          <div className="space-y-6">
            {/* Event Header */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {viewingEvent.title}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {new Date(viewingEvent.event_date).toLocaleDateString()} at {viewingEvent.event_time || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{viewingEvent.location || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MicrophoneIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {viewingEvent.guest_speakers && viewingEvent.guest_speakers.length > 0 
                          ? viewingEvent.guest_speakers.map(speaker => speaker.name).join(', ')
                          : 'No Guest Speakers'
                        }
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="inline-block w-2 h-2 rounded-full mr-2 ${
                        viewingEvent.event_mode === 'online' ? 'bg-blue-500' :
                        viewingEvent.event_mode === 'offline' ? 'bg-green-500' :
                        'bg-purple-500'
                      }"></span>
                      <span className="text-sm capitalize">Mode: {viewingEvent.event_mode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-sm text-gray-500">
                    {registrationsData.length} registration(s) received
                  </div>
                  <button
                    onClick={() => downloadRegistrationsPDF()}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <PhotoIcon className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Registrations List */}
            {registrationsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading registrations...</p>
              </div>
            ) : registrationsData.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No registrations received yet</p>
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
                        Passout Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrationsData.map((registration) => (
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {registration.first_name || 'Unknown'} {registration.last_name || 'User'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.department || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.passout_year || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.contact_number || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {registration.status || 'Registered'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Events;
