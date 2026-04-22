import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const MyPosts = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'events' or 'opportunities'
  const navigate = useNavigate();
  
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

  // Modal states
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alumni_token');
      
      console.log('🔧 Fetching my posts...');
      console.log('🔧 Token available:', !!token);
      
      if (!token) {
        setError('Please login to view your posts');
        setLoading(false);
        return;
      }

      // Fetch both opportunities and events
      console.log('🔧 Fetching opportunities and events...');
      const [opportunitiesResponse, eventsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/opportunities/my-opportunities`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/events/my-events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      console.log('🔧 Opportunities response status:', opportunitiesResponse.status);
      console.log('🔧 Events response status:', eventsResponse.status);

      if (!opportunitiesResponse.ok) throw new Error('Failed to fetch your opportunities');
      if (!eventsResponse.ok) throw new Error('Failed to fetch your events');
      
      const opportunitiesData = await opportunitiesResponse.json();
      const eventsData = await eventsResponse.json();
      
      console.log('🔧 Opportunities data:', opportunitiesData);
      console.log('🔧 Events data:', eventsData);
      
      const opportunities = opportunitiesData.data || [];
      const events = eventsData.data || [];
      
      console.log('🔧 Found opportunities:', opportunities.length);
      console.log('🔧 Found events:', events.length);
      
      setOpportunities(opportunities);
      setEvents(events);
      
      // Calculate statistics
      const eventCounts = {
        pending: events.filter(e => e.status === 'pending').length,
        approved: events.filter(e => e.status === 'approved').length,
        rejected: events.filter(e => e.status === 'rejected').length
      };
      
      const opportunityCounts = {
        pending: opportunities.filter(o => o.status === 'pending').length,
        approved: opportunities.filter(o => o.status === 'approved').length,
        rejected: opportunities.filter(o => o.status === 'rejected').length
      };
      
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventRegistrations = async (eventId) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('alumni_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/my-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch registrations');
      
      const data = await response.json();
      setRegistrations(data.data || []);
    } catch (error) {
      console.error('❌ Error fetching registrations:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchOpportunityApplications = async (opportunityId) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('alumni_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/${opportunityId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      setApplications(data.data || []);
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewRegistrations = (event) => {
    setSelectedEvent(event);
    setShowRegistrationsModal(true);
    fetchEventRegistrations(event.id);
  };

  const handleViewApplications = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowApplicationsModal(true);
    fetchOpportunityApplications(opportunity.id);
  };

  const handleEditOpportunity = (opportunityId) => {
    navigate(`/dashboard/opportunities/edit/${opportunityId}`);
  };

  const handleEditEvent = (eventId) => {
    navigate(`/dashboard/events/edit/${eventId}`);
  };

  const handleDeleteOpportunity = async (opportunityId) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) {
      return;
    }

    try {
      const token = localStorage.getItem('alumni_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/${opportunityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete opportunity');

      // Remove from list
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
      alert('Opportunity deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const token = localStorage.getItem('alumni_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete event');

      // Remove from list
      setEvents(prev => prev.filter(event => event.id !== eventId));
      alert('Event deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      job: 'bg-blue-100 text-blue-800',
      internship: 'bg-purple-100 text-purple-800',
      freelance: 'bg-orange-100 text-orange-800',
      volunteer: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  // Filter events
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
          <p className="text-gray-600">Manage opportunities and events you've posted</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/dashboard/events/add')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Add Event
          </Button>
          <Button 
            onClick={() => navigate('/dashboard/opportunities/add')}
            className="flex items-center gap-2"
          >
            <BriefcaseIcon className="h-4 w-4" />
            Post Opportunity
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Pending */}
        <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg p-5 border-2 border-dashed hover:border-solid transition-colors cursor-pointer">
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

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search your posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

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
            All ({filteredEvents.length + filteredOpportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Events ({filteredEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'opportunities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Opportunities ({filteredOpportunities.length})
          </button>
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Content based on active tab */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading your posts...</div>
        </div>
      ) : activeTab === 'events' && filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No events match your search criteria' : "You haven't posted any events yet"}
          </p>
          {!searchTerm && (
            <div className="mt-4">
              <Button onClick={() => navigate('/dashboard/events/add')}>
                Create Your First Event
              </Button>
            </div>
          )}
        </div>
      ) : activeTab === 'opportunities' && filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No opportunities match your search criteria' : "You haven't posted any opportunities yet"}
          </p>
          {!searchTerm && (
            <div className="mt-4">
              <Button onClick={() => navigate('/dashboard/opportunities/add')}>
                Post Your First Opportunity
              </Button>
            </div>
          )}
        </div>
      ) : activeTab === 'all' && filteredEvents.length === 0 && filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No posts match your search criteria' : "You haven't posted any content yet"}
          </p>
          {!searchTerm && (
            <div className="mt-4 flex gap-2 justify-center">
              <Button 
                onClick={() => navigate('/dashboard/events/add')}
                variant="outline"
              >
                Add Event
              </Button>
              <Button 
                onClick={() => navigate('/dashboard/opportunities/add')}
              >
                Post Opportunity
              </Button>
            </div>
          )}
        </div>
      ) : activeTab === 'all' ? (
        /* All Content - Combined Table with Different Columns */
        <>
          {/* Events Table */}
          {filteredEvents.length > 0 && (
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
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
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
                          <button
                            onClick={() => navigate(`/dashboard/events/${event.id}/registrations`)}
                            className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium hover:bg-green-100 transition-colors"
                          >
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {event.registrations_count || 0}/{event.capacity || '∞'} Registrations
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(event.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditEvent(event.id)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          
          {/* Opportunities Table */}
          {filteredOpportunities.length > 0 && (
            <Card className={filteredEvents.length > 0 ? 'mt-6' : ''}>
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
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applications
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOpportunities.map((opportunity) => (
                      <tr key={opportunity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                            <div className="text-sm text-gray-500">{opportunity.description?.substring(0, 100)}...</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {opportunity.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {opportunity.location || 'Remote'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(opportunity.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleViewApplications(opportunity)}
                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {opportunity.applications_count || 0} Applications
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(opportunity.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditOpportunity(opportunity.id)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOpportunity(opportunity.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
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
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleViewRegistrations(event)}
                        className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {event.registrations_count || 0}/{event.capacity || '∞'} Registrations
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(event.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditEvent(event.id)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                      {opportunity.location || 'Remote'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(opportunity.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleViewApplications(opportunity)}
                        className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {opportunity.applications_count || 0} Applications
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(opportunity.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditOpportunity(opportunity.id)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOpportunity(opportunity.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Event Registrations Modal */}
      {showRegistrationsModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Event Registrations</h3>
                <button
                  onClick={() => setShowRegistrationsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Event Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedEvent.title}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 text-gray-900">{selectedEvent.event_date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Time:</span>
                    <span className="ml-2 text-gray-900">{selectedEvent.event_time}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 text-gray-900">{selectedEvent.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacity:</span>
                    <span className="ml-2 text-gray-900">{selectedEvent.registrations_count || 0}/{selectedEvent.capacity || '∞'}</span>
                  </div>
                </div>
              </div>

              {/* Registrations List */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Registered Alumni ({registrations.length})</h4>
                {modalLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading registrations...</p>
                  </div>
                ) : registrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {registrations.map((registration) => (
                          <tr key={registration.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {registration.first_name} {registration.last_name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{registration.email}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{registration.department || 'N/A'}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                registration.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                registration.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {registration.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No registrations yet</p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowRegistrationsModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Applications Modal */}
      {showApplicationsModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Job Applications</h3>
                <button
                  onClick={() => setShowApplicationsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Opportunity Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedOpportunity.title}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Company:</span>
                    <span className="ml-2 text-gray-900">{selectedOpportunity.company}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 text-gray-900">{selectedOpportunity.location || 'Remote'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 text-gray-900">{selectedOpportunity.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Applications:</span>
                    <span className="ml-2 text-gray-900">{selectedOpportunity.applications_count || 0}</span>
                  </div>
                </div>
              </div>

              {/* Applications List */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Applicants ({applications.length})</h4>
                {modalLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading applications...</p>
                  </div>
                ) : applications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resume</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map((application) => (
                          <tr key={application.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {application.first_name} {application.last_name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{application.email}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{application.department || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {new Date(application.applied_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                application.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {application.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {application.resume_url ? (
                                <a
                                  href={application.resume_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <DocumentIcon className="h-4 w-4" />
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">No resume</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No applications yet</p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowApplicationsModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
