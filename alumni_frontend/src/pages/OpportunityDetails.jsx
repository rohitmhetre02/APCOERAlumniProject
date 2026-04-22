import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    contact_number: '',
    proposal: '',
    resume_url: ''
  });
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [contactNumberError, setContactNumberError] = useState('');

  useEffect(() => {
    const fetchOpportunityDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('alumni_token');
        
        if (!token) {
          setError('Please login to view opportunity details');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Opportunity not found');
          } else {
            throw new Error('Failed to fetch opportunity details');
          }
          return;
        }
        
        const data = await response.json();
        setOpportunity(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOpportunityDetails();
    }
  }, [id]);

  const validateContactNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (cleanNumber.length !== 10) {
      return 'Contact number must be exactly 10 digits';
    }
    
    if (!/^[6-9]/.test(cleanNumber)) {
      return 'Contact number must start with 6, 7, 8, or 9';
    }
    
    return '';
  };

  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    
    setApplicationData(prev => ({ ...prev, contact_number: digitsOnly }));
    
    const error = validateContactNumber(digitsOnly);
    setContactNumberError(error);
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('alumni_token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Update localStorage with fresh user data
          localStorage.setItem('alumni_user', JSON.stringify(data.data));
          // The AuthContext should automatically pick up the updated data
        }
      }
    } catch (error) {
      console.error('Failed to fetch fresh user data:', error);
    }
  };

  const handleApply = async () => {
    if (!opportunity) return;
    
    // Fetch fresh user data before opening modal
    await fetchUserData();
    
    // Small delay to ensure AuthContext updates
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setShowApplicationModal(true);
    setApplicationData({
      contact_number: '',
      proposal: '',
      resume_url: ''
    });
    setContactNumberError('');
  };

  const handleApplicationSubmit = async () => {
    if (!opportunity) return;

    const contactError = validateContactNumber(applicationData.contact_number);
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
      setApplicationLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          opportunity_id: opportunity.id,
          contact_number: applicationData.contact_number,
          proposal: applicationData.proposal,
          resume_url: applicationData.resume_url
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowApplicationModal(false);
        setContactNumberError('');
        alert('Application submitted successfully!');
        setOpportunity(prev => ({
          ...prev,
          has_applied: true,
          applications_count: (prev.applications_count || 0) + 1
        }));
      } else {
        alert(data.message || 'Failed to submit application');
      }
    } catch (err) {
      alert('Error submitting application. Please try again.');
    } finally {
      setApplicationLoading(false);
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;

    const token = localStorage.getItem('alumni_token');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/upload-resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Construct full URL - remove /api from the base URL for static files
        const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
        const fullUrl = `${baseUrl}${data.url}`;
        console.log('Resume uploaded successfully:', fullUrl);
        setApplicationData(prev => ({
          ...prev,
          resume_url: fullUrl
        }));
      } else {
        alert('Failed to upload resume: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      alert('Error uploading resume');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading opportunity details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl font-bold mb-2 text-red-600">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/dashboard/opportunities" className="text-blue-600">
            Go Back
          </Link>
        </Card>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl font-bold mb-2">Opportunity Not Found</h2>
          <Link to="/dashboard/opportunities" className="text-blue-600">
            Go Back
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* 🔙 Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline"
      >
        ← Back
      </button>

      {/* 🔥 HEADER (NO IMAGE) */}
      <Card>
        <h1 className="text-2xl font-bold text-gray-900">
          {opportunity.title}
        </h1>
        <p className="text-blue-600 font-medium mt-1">
          {opportunity.company}
        </p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          <span>📍 {opportunity.location || 'Not specified'}</span>
          <span>💼 {opportunity.type}</span>
          <span>⏳ {opportunity.experience_range || 'Not specified'}</span>
          <span>💰 {opportunity.salary_range || 'Not specified'}</span>
          {opportunity.deadline && (
            <span>📅 Apply by: {new Date(opportunity.deadline).toLocaleDateString()}</span>
          )}
        </div>
      </Card>

      {/* 🔹 MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <Card>
            <h2 className="text-lg font-semibold mb-2">
              Job Description
            </h2>
            <p className="text-gray-600">{opportunity.description}</p>
          </Card>

          {/* Skills */}
          {opportunity.skills && opportunity.skills.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold mb-2">
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {opportunity.skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          )}

          
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">

          {/* Info */}
          <Card>
            <h3 className="font-semibold mb-3">Quick Info</h3>

            <p><span className="text-gray-500">Posted:</span> {new Date(opportunity.created_at).toLocaleDateString()}</p>
            {opportunity.deadline && (
              <p><span className="text-gray-500">Deadline:</span> {new Date(opportunity.deadline).toLocaleDateString()}</p>
            )}
            <p><span className="text-gray-500">Type:</span> {opportunity.type}</p>
            <p><span className="text-gray-500">Location:</span> {opportunity.location || 'Not specified'}</p>
            <p><span className="text-gray-500">Experience:</span> {opportunity.experience_range || 'Not specified'}</p>
            <p><span className="text-gray-500">Salary:</span> {opportunity.salary_range || 'Not specified'}</p>
          </Card>

          {/* Actions */}
          <Card>
            <button 
              onClick={handleApply}
              disabled={opportunity?.has_applied}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                opportunity?.has_applied 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {opportunity?.has_applied ? 'Already Applied' : 'Apply Now'}
            </button>
            {opportunity?.applications_count !== undefined && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                {opportunity.applications_count} applications
              </p>
            )}
          </Card>

        </div>

      </div>

      {/* Application Modal */}
      {showApplicationModal && opportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Apply for {opportunity.title}</h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-500"
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
                  value={applicationData.contact_number}
                  onChange={handleContactNumberChange}
                  placeholder="Enter 10-digit mobile number"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    contactNumberError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength="10"
                  required
                />
                {contactNumberError && (
                  <p className="mt-1 text-sm text-red-600">{contactNumberError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Enter 10-digit mobile number starting with 6, 7, 8, or 9</p>
              </div>

              {/* Proposal (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Proposal (Optional)</label>
                <textarea
                  value={applicationData.proposal}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, proposal: e.target.value }))}
                  placeholder="Tell us why you're interested in this opportunity..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Resume Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleResumeUpload(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {applicationData.resume_url && (
                  <p className="mt-2 text-sm text-green-600">✓ Resume uploaded successfully</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={applicationLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplicationSubmit}
                  disabled={applicationLoading || !applicationData.contact_number || !applicationData.resume_url || contactNumberError}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applicationLoading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetails;