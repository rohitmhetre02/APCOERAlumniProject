import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  MicrophoneIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Registration modal state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    contact_number: ''
  });
  const [contactNumberError, setContactNumberError] = useState('');

  const handleAddEvent = () => {
    const token = localStorage.getItem('alumni_token');
    
    if (!token) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    navigate('/dashboard/events/add');
  };

  // Fetch approved events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/approved`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      setEvents(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Contact number validation
  const validateContactNumber = (number) => {
    if (!number) return 'Contact number is required';
    if (!/^[6-9]\d{9}$/.test(number)) {
      return 'Contact number must be a valid 10-digit Indian mobile number starting with 6-9';
    }
    return '';
  };

  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    
    setRegistrationData(prev => ({ ...prev, contact_number: digitsOnly }));
    
    const error = validateContactNumber(digitsOnly);
    setContactNumberError(error);
  };

  const handleRegister = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
    setRegistrationData({ contact_number: '' });
    setContactNumberError('');
  };

  const handleRegistrationSubmit = async () => {
    if (!selectedEvent) return;

    // Validate contact number
    const contactError = validateContactNumber(registrationData.contact_number);
    if (contactError) {
      setContactNumberError(contactError);
      return;
    }

    const token = localStorage.getItem('alumni_token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setRegistrationLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/event-registrations/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          contact_number: registrationData.contact_number
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update the event in the list to show it has been registered and update count
        setEvents(prev => 
          prev.map(event => 
            event.id === selectedEvent.id 
              ? { 
                  ...event, 
                  has_registered: true,
                  registrations_count: data.event?.registrations_count || (event.registrations_count || 0) + 1
                }
              : event
          )
        );
        
        setShowRegistrationModal(false);
        setContactNumberError('');
        alert('Event registration successful!');
      } else {
        alert('Failed to register: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error registering for event. Please try again.');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upcoming Events
            </h1>
            <p className="text-gray-600">
              Discover and participate in exciting alumni events
            </p>
          </div>
          <Button 
            onClick={handleAddEvent}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Event
          </Button>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by title, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading events...</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No events found' : 'No upcoming events'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Check back later for new events'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Event Image */}
                {event.image_url && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Event Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      {event.event_time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-4 w-4" />
                      Registered: {event.registrations_count || 0}/{event.capacity}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {event.event_mode}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {event.event_type === 'other' ? event.custom_event_type : event.event_type}
                      </span>
                    </div>
                  </div>

                  {/* Guest Speakers */}
                  {event.guest_speakers && event.guest_speakers.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                        <MicrophoneIcon className="h-4 w-4" />
                        <span className="font-medium">Guest Speakers:</span>
                      </div>
                      <div className="space-y-1">
                        {event.guest_speakers.slice(0, 2).map((speaker, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            <span className="font-medium">{speaker.name}</span> - {speaker.topic}
                          </div>
                        ))}
                        {event.guest_speakers.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{event.guest_speakers.length - 2} more speakers
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/dashboard/events/${event.id}`)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    
                    <Button 
                      size="sm"
                      onClick={() => handleRegister(event)}
                      disabled={event.has_registered}
                      className="flex-1"
                    >
                      {event.has_registered ? 'Registered' : 'Register'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Registration Modal */}
        {showRegistrationModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Register for {selectedEvent.title}
                </h2>
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* User Information (Read-only) */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={user ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() : 'Loading...'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={user?.department || 'Not specified'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passout Year</label>
                    <input
                      type="text"
                      value={user?.passout_year || 'Not specified'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Editable Contact Number */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  value={registrationData.contact_number}
                  onChange={handleContactNumberChange}
                  placeholder="Enter your 10-digit mobile number"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    contactNumberError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={10}
                />
                {contactNumberError && (
                  <p className="mt-1 text-sm text-red-600">{contactNumberError}</p>
                )}
              </div>

              {/* Event Details */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Event Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Date:</strong> {new Date(selectedEvent.event_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {selectedEvent.event_time}</p>
                  <p><strong>Location:</strong> {selectedEvent.location}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegistrationSubmit}
                  disabled={registrationLoading || !!contactNumberError}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {registrationLoading ? 'Registering...' : 'Register for this event'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
