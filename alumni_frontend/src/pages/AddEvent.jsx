import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

const AddEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    event_type: 'Workshop',
    custom_event_type: '',
    event_mode: 'offline',
    image_url: '',
    guest_speakers: [
      { name: '', topic: '', role: '' }
    ],
    status: 'pending' // Default status for alumni submissions
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGuestSpeakerChange = (index, field, value) => {
    const updatedSpeakers = [...formData.guest_speakers];
    updatedSpeakers[index][field] = value;
    setFormData({
      ...formData,
      guest_speakers: updatedSpeakers
    });
  };

  const addGuestSpeaker = () => {
    setFormData({
      ...formData,
      guest_speakers: [
        ...formData.guest_speakers,
        { name: '', topic: '', role: '' }
      ]
    });
  };

  const removeGuestSpeaker = (index) => {
    const updatedSpeakers = formData.guest_speakers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      guest_speakers: updatedSpeakers
    });
  };

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
      const token = localStorage.getItem('alumni_token');
      
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('alumni_token');
      
      if (!token) {
        setError('Please login to post events');
        setLoading(false);
        return;
      }

      // Filter out empty guest speakers
      const filteredSpeakers = formData.guest_speakers.filter(
        speaker => speaker.name || speaker.topic || speaker.role
      );

      const eventData = {
        title: formData.title,
        description: formData.description,
        event_date: formData.date, // Map frontend 'date' to backend 'event_date'
        event_time: formData.time, // Map frontend 'time' to backend 'event_time'
        location: formData.location,
        event_mode: formData.event_mode,
        capacity: formData.capacity,
        event_type: formData.event_type,
        custom_event_type: formData.custom_event_type,
        image_url: formData.image_url,
        guest_speakers: filteredSpeakers,
        created_by: JSON.parse(localStorage.getItem('alumni_user'))?.id,
        created_by_role: 'alumni'
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      const data = await response.json();
      setSuccess('Event posted successfully! It will be visible after admin approval.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        capacity: '',
        event_type: 'Workshop',
        custom_event_type: '',
        event_mode: 'offline',
        image_url: '',
        guest_speakers: [
          { name: '', topic: '', role: '' }
        ],
        status: 'pending'
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/my-posts');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Event</h1>
          <p className="text-gray-600">Share events with the alumni community</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Alumni Tech Meet 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Description *
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about the event, agenda, and what attendees can expect..."
                rows={6}
                required
              />
            </div>
          </div>

          {/* Event Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Event Image</h3>
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
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Event Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Time *
                </label>
                <Input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., APCOER Auditorium, Pune"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <Input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Networking">Networking</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.event_type === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Event Type
                  </label>
                  <Input
                    type="text"
                    name="custom_event_type"
                    value={formData.custom_event_type}
                    onChange={handleChange}
                    placeholder="Specify event type"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Mode *
                </label>
                <select
                  name="event_mode"
                  value={formData.event_mode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Guest Speakers */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900">Guest Speakers</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGuestSpeaker}
              >
                Add Speaker
              </Button>
            </div>

            {formData.guest_speakers.map((speaker, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Speaker {index + 1}</h4>
                  {formData.guest_speakers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeGuestSpeaker(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input
                      type="text"
                      value={speaker.name}
                      onChange={(e) => handleGuestSpeakerChange(index, 'name', e.target.value)}
                      placeholder="Speaker name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic
                    </label>
                    <Input
                      type="text"
                      value={speaker.topic}
                      onChange={(e) => handleGuestSpeakerChange(index, 'topic', e.target.value)}
                      placeholder="Topic/Session"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role/Designation
                    </label>
                    <Input
                      type="text"
                      value={speaker.role}
                      onChange={(e) => handleGuestSpeakerChange(index, 'role', e.target.value)}
                      placeholder="e.g., CEO, Director"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Posting Event...
                </>
              ) : (
                <>
                  <CalendarIcon className="h-4 w-4" />
                  Post Event
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddEvent;
