import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user's registered events
  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alumni_token');
      
      if (!token) {
        setError('Please login to view your registered events');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/event-registrations/my-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch your events');
      }
      
      const data = await response.json();
      setEvents(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      registered: 'bg-blue-100 text-blue-800',
      attended: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const statusLower = status?.toLowerCase() || status;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[statusLower] || 'bg-gray-100 text-gray-800'}`}>
        {statusLower === 'registered' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
        {statusLower === 'attended' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
        {statusLower === 'cancelled' && <XCircleIcon className="w-3 h-3 mr-1" />}
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeStyles = {
      networking: 'bg-purple-100 text-purple-800',
      educational: 'bg-indigo-100 text-indigo-800',
      workshop: 'bg-orange-100 text-orange-800',
      seminar: 'bg-blue-100 text-blue-800',
      social: 'bg-pink-100 text-pink-800'
    };
    
    const typeLower = type?.toLowerCase() || type;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeStyles[typeLower] || 'bg-gray-100 text-gray-800'}`}>
        {typeLower === 'networking' && <UserGroupIcon className="w-3 h-3 mr-1" />}
        {typeLower === 'educational' && <CalendarIcon className="w-3 h-3 mr-1" />}
        {typeLower === 'workshop' && <CalendarIcon className="w-3 h-3 mr-1" />}
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Registered Events</h1>
        <p className="text-gray-600">View and manage your event registrations</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your events...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Events Table */}
      {!loading && !error && (
        <Card className="p-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Registered Events</h3>
              <p className="text-gray-500 mb-6">You haven't registered for any events yet.</p>
              <Link 
                to="/dashboard/events" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                  {/* Event Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {event.title || event.event_title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getTypeBadge(event.event_type || event.type)}
                        {getStatusBadge(event.status)}
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4">
                      <Link 
                        to={`/dashboard/events/${event.event_id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    {/* Date & Time */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Date & Time</p>
                        <p className="text-gray-600">
                          {new Date(event.event_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 flex items-center mt-1">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {event.event_time}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-gray-600">{event.location}</p>
                      </div>
                    </div>

                    {/* Registration Date */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Registered On</p>
                        <p className="text-gray-600">
                          {new Date(event.registration_date || event.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Action Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100 sm:hidden">
                    <Link 
                      to={`/dashboard/events/${event.event_id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Event Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default MyEvents;
