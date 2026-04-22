import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Card from "../components/ui/Card";
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Registration modal state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    contact_number: ''
  });
  const [contactNumberError, setContactNumberError] = useState('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('alumni_token');
        
        if (!token) {
          setError('Please login to view event details and register for events');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Event not found');
          } else if (response.status === 401) {
            setError('Please login to view event details');
          } else if (response.status === 403) {
            setError('Access denied. You do not have permission to view this event.');
          } else {
            setError('Failed to fetch event details. Please try again.');
          }
          return;
        }
        
        const data = await response.json();
        setEvent(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

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

  const handleRegister = () => {
    if (!event) return;
    setShowRegistrationModal(true);
    setRegistrationData({ contact_number: '' });
    setContactNumberError('');
  };

  const handleRegistrationSubmit = async () => {
    if (!event) return;

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
          event_id: event.id,
          contact_number: registrationData.contact_number
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update the event to show it has been registered and update count
        setEvent(prev => ({ 
          ...prev, 
          has_registered: true,
          registrations_count: data.event?.registrations_count || (prev.registrations_count || 0) + 1
        }));
        
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/dashboard/events"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Events
          </Link>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
          <Link 
            to="/dashboard/events"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Events
          </Link>
        </Card>
      </div>
    );
  }

  const isRegistrationOpen = event.deadline ? new Date() <= new Date(event.deadline) : true;
  const spotsAvailable = event.capacity ? event.capacity - (event.registrations_count || 0) : 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </button>

      {/* Header Image */}
     <div className="max-w-4xl mx-auto">
  <div className="relative rounded-xl overflow-hidden shadow">

    <img
      src={event.image_url || 'https://picsum.photos/seed/event-default/800/400.jpg'}
      alt={event.title}
      className="w-full h-64 object-cover"
    />

    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

    <div className="absolute bottom-6 left-6 text-white">
      <h1 className="text-2xl md:text-3xl font-bold mb-1">
        {event.title}
      </h1>
      <p className="text-sm md:text-lg">
        {event.organizer}
      </p>
    </div>

  </div>
</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Description */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </Card>

          {/* Event Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Agenda</h2>
              <div className="space-y-3">
                {event.agenda.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Speakers */}
          {event.guest_speakers && event.guest_speakers.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest Speakers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.guest_speakers.map((speaker, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900">{speaker.name}</h3>
                    <p className="text-sm text-gray-600">{speaker.role}</p>
                    <p className="text-sm text-blue-600">Topic: {speaker.topic}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBD'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{event.event_time || 'TBD'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{event.location || 'TBD'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Type</p>
                <p className="font-medium text-gray-900">
                  {event.event_type === 'other' ? event.custom_event_type : event.event_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Mode</p>
                <p className="font-medium text-gray-900 capitalize">{event.event_mode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-medium text-gray-900">{event.capacity || 'Unlimited'}</p>
              </div>
            </div>
          </Card>

          {/* Registration Status */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Registered</span>
                  <span className="text-sm font-medium text-gray-900">
                    {event.registrations_count || 0}/{event.capacity || 'Unlimited'}
                  </span>
                </div>
                {event.capacity && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((event.registrations_count || 0) / event.capacity * 100, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
              {event.deadline && (
                <div>
                  <p className="text-sm text-gray-500">Registration Deadline</p>
                  <p className="font-medium text-gray-900">
                    {new Date(event.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Spots Available</p>
                <p className="font-medium text-green-600">{spotsAvailable} spots left</p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <Card>
            {event.has_registered ? (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-2">✓ Registered</p>
                <p className="text-sm text-gray-500">You have successfully registered for this event</p>
              </div>
            ) : isRegistrationOpen ? (
              <>
                <button 
                  onClick={handleRegister}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Register Now
                </button>
                
              </>
            ) : (
              <div className="text-center">
                <p className="text-red-600 font-medium mb-2">Registration Closed</p>
                <p className="text-sm text-gray-500">Registration deadline has passed</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && event && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Register for {event.title}
              </h2>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {event.event_time}</p>
                <p><strong>Location:</strong> {event.location}</p>
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
  );
};

export default EventDetails;
