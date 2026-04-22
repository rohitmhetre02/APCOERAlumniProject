import React, { useState, useEffect } from 'react';
import { 
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  MicrophoneIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  BriefcaseIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

const ContentApproval = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingOpportunities, setPendingOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'events' or 'opportunities'
  
  // Content counts
  const [contentCounts, setContentCounts] = useState({
    events: {
      pending: 0,
      approved: 0,
      rejected: 0
    },
    opportunities: {
      pending: 0,
      approved: 0,
      rejected: 0
    },
    total: {
      pending: 0,
      approved: 0,
      rejected: 0
    }
  });

  // Fetch pending events
  const fetchPendingEvents = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch pending events');
      
      const data = await response.json();
      setPendingEvents(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch pending opportunities
  const fetchPendingOpportunities = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch pending opportunities');
      
      const data = await response.json();
      setPendingOpportunities(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch all events with status
  const fetchAllEvents = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      const events = data.data || [];
      
      // Count events by status
      const eventCounts = {
        pending: events.filter(e => e.status === 'pending').length,
        approved: events.filter(e => e.status === 'approved').length,
        rejected: events.filter(e => e.status === 'rejected').length
      };
      
      return eventCounts;
    } catch (err) {
      console.error('Error fetching all events:', err);
      return { pending: 0, approved: 0, rejected: 0 };
    }
  };

  // Fetch all opportunities with status
  const fetchAllOpportunities = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch opportunities');
      
      const data = await response.json();
      const opportunities = data.data || [];
      
      // Count opportunities by status
      const opportunityCounts = {
        pending: opportunities.filter(o => o.status === 'pending').length,
        approved: opportunities.filter(o => o.status === 'approved').length,
        rejected: opportunities.filter(o => o.status === 'rejected').length
      };
      
      return opportunityCounts;
    } catch (err) {
      console.error('Error fetching all opportunities:', err);
      return { pending: 0, approved: 0, rejected: 0 };
    }
  };

  // Fetch content statistics
  const fetchContentStatistics = async () => {
    try {
      const [eventCounts, opportunityCounts] = await Promise.all([
        fetchAllEvents(),
        fetchAllOpportunities()
      ]);
      
      const totalCounts = {
        pending: eventCounts.pending + opportunityCounts.pending,
        approved: eventCounts.approved + opportunityCounts.approved,
        rejected: eventCounts.rejected + opportunityCounts.rejected
      };
      
      setContentCounts({
        events: eventCounts,
        opportunities: opportunityCounts,
        total: totalCounts
      });
    } catch (err) {
      console.error('Error fetching content statistics:', err);
    }
  };

  // Fetch all pending content
  const fetchPendingContent = async () => {
    try {
      setLoading(true);
      setError('');
      await Promise.all([
        fetchPendingEvents(),
        fetchPendingOpportunities(),
        fetchContentStatistics()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingContent();
  }, []);

  // Approve content (event or opportunity)
  const handleApprove = async (item) => {
    try {
      const token = localStorage.getItem('admin_token');
      const endpoint = item.type === 'opportunity' 
        ? `${import.meta.env.VITE_API_URL}/opportunities/${item.id}/approve`
        : `${import.meta.env.VITE_API_URL}/events/${item.id}/approve`;
      
      console.log(`🔧 Approving ${item.type} with ID: ${item.id}`);
      console.log(`🔧 Endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`🔧 Approval response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to approve ${item.type}`);
      }

      const result = await response.json();
      console.log(`🔧 Approval result:`, result);
      
      // Show success message with email notification info
      const itemType = item.type === 'opportunity' ? 'Opportunity' : 'Event';
      setSuccess(`${itemType} approved successfully! Emails are being sent to the creator and all alumni members.`);
      
      // Refresh the content list
      fetchPendingContent();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      console.error(`🔧 Error approving ${item?.type}:`, err);
      setError(`Failed to approve ${item?.type}: ${err.message}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
  };

  // Reject content (event or opportunity)
  const handleReject = async (item) => {
    try {
      const token = localStorage.getItem('admin_token');
      const endpoint = item.type === 'opportunity'
        ? `${import.meta.env.VITE_API_URL}/opportunities/${item.id}/reject`
        : `${import.meta.env.VITE_API_URL}/events/${item.id}/reject`;
      
      console.log(`🔧 Rejecting ${item.type} with ID: ${item.id}`);
      console.log(`🔧 Endpoint: ${endpoint}`);
      console.log(`🔧 Rejection reason: ${rejectionReason}`);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason: rejectionReason })
      });

      console.log(`🔧 Rejection response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to reject ${item.type}`);
      }

      const data = await response.json();
      console.log(`🔧 Rejection result:`, data);
      
      // Show success message with email notification info
      const itemType = item.type === 'opportunity' ? 'Opportunity' : 'Event';
      setSuccess(`${itemType} rejected successfully! Rejection email has been sent to the creator.`);
      
      // Refresh the content list and close modals
      await fetchPendingContent();
      setShowDetailModal(false);
      setShowRejectModal(false);
      setRejectionReason('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      console.error(`🔧 Error rejecting ${item?.type}:`, err);
      setError(`Failed to reject ${item?.type}: ${err.message}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
  };

  // View content details
  const viewContentDetails = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowDetailModal(true);
  };

  // Open reject modal
  const openRejectModal = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowRejectModal(true);
  };

  // Filter events
  const filteredEvents = pendingEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter opportunities
  const filteredOpportunities = pendingOpportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Approval</h1>
          <p className="text-gray-600">Review and approve pending content</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Pending */}
        <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg p-5 border-2 border-dashed hover:border-solid transition-colors cursor-pointer ">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-yellow-800">Total Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{contentCounts.total.pending}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-2">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-yellow-100 border border-dashed border-yellow-200 rounded p-2 text-center">
              <p className="text-xs text-yellow-700">Total</p>
              <p className="text-lg font-bold text-yellow-800">{contentCounts.events.pending + contentCounts.opportunities.pending}</p>
            </div>
            <div className="bg-yellow-100 border border-dashed border-yellow-200 rounded p-2 text-center">
              <p className="text-xs text-yellow-700">Events</p>
              <p className="text-lg font-bold text-yellow-800">{contentCounts.events.pending}</p>
            </div>
            <div className="bg-yellow-100 border border-dashed border-yellow-200 rounded p-2 text-center">
              <p className="text-xs text-yellow-700">Opportunities</p>
              <p className="text-lg font-bold text-yellow-800">{contentCounts.opportunities.pending}</p>
            </div>
          </div>
        </div>

        {/* Total Approved */}
        <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-5 border-2 border-dashed hover:border-solid transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-green-800">Total Approved</p>
              <p className="text-2xl font-bold text-green-900">{contentCounts.total.approved}</p>
            </div>
            <div className="bg-green-100 rounded-full p-2">
              <CheckIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-100 border border-dashed border-green-200 rounded p-2 text-center">
              <p className="text-xs text-green-700">Total</p>
              <p className="text-lg font-bold text-green-800">{contentCounts.events.approved + contentCounts.opportunities.approved}</p>
            </div>
            <div className="bg-green-100 border border-dashed border-green-200 rounded p-2 text-center">
              <p className="text-xs text-green-700">Events</p>
              <p className="text-lg font-bold text-green-800">{contentCounts.events.approved}</p>
            </div>
            <div className="bg-green-100 border border-dashed border-green-200 rounded p-2 text-center">
              <p className="text-xs text-green-700">Opportunities</p>
              <p className="text-lg font-bold text-green-800">{contentCounts.opportunities.approved}</p>
            </div>
          </div>
        </div>

        {/* Total Rejected */}
        <div className="bg-red-50 border-2 border-dashed border-red-300 rounded-lg p-5 border-2 border-dashed hover:border-solid transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-red-800">Total Rejected</p>
              <p className="text-2xl font-bold text-red-900">{contentCounts.total.rejected}</p>
            </div>
            <div className="bg-red-100 rounded-full p-2">
              <XMarkIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-red-100 border border-dashed border-red-200 rounded p-2 text-center">
              <p className="text-xs text-red-700">Total</p>
              <p className="text-lg font-bold text-red-800">{contentCounts.events.rejected + contentCounts.opportunities.rejected}</p>
            </div>
            <div className="bg-red-100 border border-dashed border-red-200 rounded p-2 text-center">
              <p className="text-xs text-red-700">Events</p>
              <p className="text-lg font-bold text-red-800">{contentCounts.events.rejected}</p>
            </div>
            <div className="bg-red-100 border border-dashed border-red-200 rounded p-2 text-center">
              <p className="text-xs text-red-700">Opportunities</p>
              <p className="text-lg font-bold text-red-800">{contentCounts.opportunities.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All ({pendingEvents.length + pendingOpportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Events ({pendingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'opportunities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Opportunities ({pendingOpportunities.length})
          </button>
        </nav>
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

      
      {/* Content based on active tab */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading pending {activeTab}...</div>
        </div>
      ) : activeTab === 'events' && filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending events</h3>
          <p className="text-gray-500">
            All events have been reviewed
          </p>
        </div>
      ) : activeTab === 'opportunities' && filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending opportunities</h3>
          <p className="text-gray-500">
            All opportunities have been reviewed
          </p>
        </div>
      ) : activeTab === 'all' && filteredEvents.length === 0 && filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending content</h3>
          <p className="text-gray-500">
            All content has been reviewed
          </p>
        </div>
      ) : activeTab === 'all' ? (
        /* All Content - Combined Table with Different Columns */
        <>
          {/* Events Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Events */}
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                         <div className="text-sm text-gray-500">{event.event_type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(event.event_date).toLocaleDateString()} {new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.author_name || 'Unknown'}
                        <div className="text-sm text-gray-500">{event.author_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => viewContentDetails(event, 'event')}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="View"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApprove({ ...event, type: 'event' })}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                            title="Approve"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(event, 'event')}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Reject"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Opportunities Table */}
          <Card className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opportunity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Opportunities */}
                  {filteredOpportunities.map((opportunity) => (
                    <tr key={opportunity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                          <div className="text-sm text-gray-500">{opportunity.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.location || 'Remote'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.author_name || 'Unknown'}
                        <div className="text-sm text-gray-500">{opportunity.author_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => viewContentDetails(opportunity, 'opportunity')}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="View"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApprove({ ...opportunity, type: 'opportunity' })}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                            title="Approve"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(opportunity, 'opportunity')}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Reject"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : activeTab === 'events' ? (
        /* Events Table */
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.event_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.event_date}</div>
                      <div className="text-sm text-gray-500">{event.event_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.author_name}</div>
                      <div className="text-sm text-gray-500">{event.author_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewContentDetails(event, 'event')}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove({ ...event, type: 'event' })}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRejectModal(event, 'event')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Opportunities Table */
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opportunity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOpportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                        <div className="text-sm text-gray-500">{opportunity.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opportunity.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opportunity.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{opportunity.author_name}</div>
                      <div className="text-sm text-gray-500">{opportunity.author_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewContentDetails(opportunity, 'opportunity')}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove({ ...opportunity, type: 'opportunity' })}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRejectModal(opportunity, 'opportunity')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Content Details Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedItem?.type === 'opportunity' ? 'Opportunity Details' : 'Event Details'}
        size="lg"
      >
        {selectedItem && selectedItem.type === 'event' ? (
          <div className="space-y-6">
            {/* Event Image */}
            {selectedItem.image_url && (
              <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{selectedItem.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <p className="text-gray-900">{selectedItem.event_date}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Time:</span>
                  <p className="text-gray-900">{selectedItem.event_time}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-900">{selectedItem.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Mode:</span>
                  <p className="text-gray-900 capitalize">{selectedItem.event_mode}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedItem.description}</p>
            </div>

            {/* Submitted By */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Submitted By</h4>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {selectedItem.author_name}</p>
                <p><span className="font-medium">Email:</span> {selectedItem.author_email}</p>
                <p><span className="font-medium">Submitted:</span> {new Date(selectedItem.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 text-green-600 bg-green-50 border-green-600 hover:bg-green-100"
                onClick={() => handleApprove(selectedItem)}
              >
                <CheckIcon className="h-4 w-4" />
                Approve Event
              </Button>
              <Button
                className="flex-1 text-red-600 bg-red-50 border-red-600 hover:bg-red-100"
                onClick={() => openRejectModal(selectedItem)}
              >
                <XMarkIcon className="h-4 w-4" />
                Reject Event
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{selectedItem?.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Company:</span>
                  <p className="text-gray-900">{selectedItem?.company}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-900">{selectedItem?.type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-900">{selectedItem?.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Salary Range:</span>
                  <p className="text-gray-900">{selectedItem?.salary_range}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedItem?.description}</p>
            </div>

            {/* Requirements */}
            {selectedItem?.requirements && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Requirements</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedItem.requirements}</p>
              </div>
            )}

            {/* Submitted By */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Submitted By</h4>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {selectedItem?.author_name}</p>
                <p><span className="font-medium">Email:</span> {selectedItem?.author_email}</p>
                <p><span className="font-medium">Submitted:</span> {new Date(selectedItem?.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 text-green-600 bg-green-50 border-green-600 hover:bg-green-100"
                onClick={() => handleApprove(selectedItem)}
              >
                <CheckIcon className="h-4 w-4" />
                Approve Opportunity
              </Button>
              <Button
                className="flex-1 text-red-600 bg-red-50 border-red-600 hover:bg-red-100"
                onClick={() => openRejectModal(selectedItem)}
              >
                <XMarkIcon className="h-4 w-4" />
                Reject Opportunity
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title={`Reject ${selectedItem?.type === 'opportunity' ? 'Opportunity' : 'Event'}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Confirm Rejection</h4>
              <p className="text-sm text-yellow-700">
                This action will reject the {selectedItem?.type === 'opportunity' ? 'opportunity' : 'event'} and notify the submitter.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                handleReject(selectedItem);
                setShowRejectModal(false);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={!rejectionReason.trim()}
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Reject {selectedItem?.type === 'opportunity' ? 'Opportunity' : 'Event'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContentApproval;
