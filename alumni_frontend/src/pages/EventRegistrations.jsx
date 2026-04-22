import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const EventRegistrations = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch event details and registrations
  const fetchEventRegistrations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alumni_token');
      
      if (!token) {
        setError('Please login to view registrations');
        setLoading(false);
        return;
      }

      if (!eventId || eventId === 'undefined') {
        setError('Invalid event ID');
        setLoading(false);
        return;
      }

      // Fetch event details
      const eventResponse = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch registrations for this event (using alumni-specific endpoint)
      const registrationsResponse = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/my-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!eventResponse.ok) throw new Error('Failed to fetch event details');
      if (!registrationsResponse.ok) throw new Error('Failed to fetch registrations');

      const eventData = await eventResponse.json();
      const registrationsData = await registrationsResponse.json();
      
      setEvent(eventData.data);
      setRegistrations(registrationsData.data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      if (err.message.includes('404')) {
        setError('Event not found');
      } else if (err.message.includes('403')) {
        setError('You do not have permission to view registrations for this event');
      } else {
        setError('Failed to fetch registrations. Please try again later.');
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventRegistrations();
  }, [eventId]);

  // Handle registration actions
  const handleAcceptRegistration = async (registrationId) => {
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/registrations/${registrationId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to accept registration');

      setSuccess('Registration accepted successfully');
      fetchEventRegistrations(); // Refresh data
      setShowDetailModal(false);
    } catch (err) {
      setError('Failed to accept registration');
    }
  };

  const handleRejectRegistration = async (registrationId, reason = '') => {
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/registrations/${registrationId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason: reason })
      });

      if (!response.ok) throw new Error('Failed to reject registration');

      setSuccess('Registration rejected successfully');
      fetchEventRegistrations(); // Refresh data
      setShowDetailModal(false);
    } catch (err) {
      setError('Failed to reject registration');
    }
  };

  const handleViewRegistration = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'pending'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  // Show error state if event ID is invalid
  if (!eventId || eventId === 'undefined') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Event</h3>
          <p className="text-gray-500 mb-4">
            The event ID is invalid or missing. Please go back and try again.
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/dashboard/my-posts')}
            >
              My Posts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to My Posts
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Registrations</h1>
          <p className="text-gray-600">Review and manage registrations for your event</p>
        </div>
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

      {/* Event Details */}
      {event && (
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{event.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="text-sm font-medium text-gray-900">
                        {registrations.length}/{event.capacity || 'Unlimited'}
                      </p>
                    </div>
                  </div>
                </div>
                {event.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm text-gray-900 mt-1">{event.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Registrations Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Registered Users ({registrations.length})</h3>
          </div>

          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
              <p className="text-gray-500">
                Registrations for this event will appear here once submitted.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered On
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
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {registration.first_name} {registration.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{registration.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {registration.phone && (
                            <div className="flex items-center gap-1">
                              <PhoneIcon className="h-4 w-4 text-gray-400" />
                              {registration.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(registration.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(registration.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewRegistration(registration)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {registration.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAcceptRegistration(registration.id)}
                                className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                                title="Accept Registration"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectRegistration(registration.id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                title="Reject Registration"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Registration Detail Modal */}
      {showDetailModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Registration Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">User Information</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedRegistration.first_name} {selectedRegistration.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedRegistration.email}</p>
                    </div>
                    {selectedRegistration.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{selectedRegistration.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedRegistration.status)}</div>
                    </div>
                  </div>
                </div>

                {selectedRegistration.message && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Message</h4>
                    <p className="mt-2 text-sm text-gray-900">{selectedRegistration.message}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Registration Information</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Registered On</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedRegistration.created_at).toLocaleDateString()} at{' '}
                        {new Date(selectedRegistration.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration ID</p>
                      <p className="text-sm font-medium text-gray-900">{selectedRegistration.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRegistration.status === 'pending' && (
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => handleAcceptRegistration(selectedRegistration.id)}
                    className="flex items-center gap-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Accept Registration
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const reason = prompt('Please provide a reason for rejection (optional):');
                      if (reason !== null) {
                        handleRejectRegistration(selectedRegistration.id, reason);
                      }
                    }}
                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Reject Registration
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistrations;
