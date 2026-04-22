import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Opportunities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alumni_token');
      
      if (!token) {
        setError('Please login to view opportunities');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/approved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch opportunities');
      
      const data = await response.json();
      setOpportunities(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (opportunityId) => {
    try {
      setApplying(prev => ({ ...prev, [opportunityId]: true }));
      const token = localStorage.getItem('alumni_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          opportunity_id: opportunityId,
          contact_number: '',
          proposal: 'Interested in this opportunity',
          resume_url: ''
        })
      });

      if (!response.ok) throw new Error('Failed to submit application');
      
      // Update the opportunity to show it's been applied to
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, has_applied: true, applications_count: (opp.applications_count || 0) + 1 }
          : opp
      ));
      
      alert('Application submitted successfully!');
    } catch (err) {
      alert('Failed to submit application: ' + err.message);
    } finally {
      setApplying(prev => ({ ...prev, [opportunityId]: false }));
    }
  };

  const handleApplicationSubmit = async () => {
    if (!selectedOpportunity) return;

    // Validate contact number
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

      const applicationPayload = {
        opportunity_id: selectedOpportunity.id,
        contact_number: applicationData.contact_number,
        proposal: applicationData.proposal,
        resume_url: applicationData.resume_url
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationPayload)
      });

      const data = await response.json();

      if (data.success) {
        // Update the opportunity in the list to show it has been applied
        setOpportunities(prev => 
          prev.map(opp => 
            opp.id === selectedOpportunity.id 
              ? { ...opp, has_applied: true, applications_count: (opp.applications_count || 0) + 1 }
              : opp
          )
        );
        
        setShowApplicationModal(false);
        setContactNumberError('');
        alert('Application submitted successfully!');
      } else {
        alert('Failed to submit application: ' + (data.message || 'Unknown error'));
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

  const openDetailModal = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOpportunity(null);
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = searchTerm === '' || 
                         opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || opportunity.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type) => {
    const typeLower = type?.toLowerCase() || type;
    const styles = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-green-100 text-green-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-orange-100 text-orange-800',
      'remote': 'bg-indigo-100 text-indigo-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[typeLower] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const handlePostOpportunity = () => {
    navigate('/dashboard/opportunities/add');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Career Opportunities</h1>
            <p className="text-gray-600">Loading opportunities...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Career Opportunities</h1>
          <p className="text-gray-600">Discover job opportunities shared by alumni</p>
        </div>
        <Button 
          onClick={handlePostOpportunity}
          className="flex items-center gap-2"
        >
          <BriefcaseIcon className="h-4 w-4" />
          Post Opportunity
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <Card className="p-12 text-center">
          <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterType !== 'all' ? 'No opportunities found' : 'No opportunities available'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Be the first to post an opportunity!'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <Button onClick={handlePostOpportunity}>
              Post First Opportunity
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {opportunity.title}
                    </h3>
                    {getTypeBadge(opportunity.type)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                    {opportunity.company}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {opportunity.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {opportunity.location}
                    </div>
                  )}
                  {opportunity.salary && (
                    <div className="flex items-center text-sm text-gray-500">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      {opportunity.salary}
                    </div>
                  )}
                  {opportunity.application_deadline && (
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Apply by: {new Date(opportunity.application_deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Description */}
                {opportunity.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {opportunity.description}
                  </p>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/dashboard/opportunities/${opportunity.id}`)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    
                    <Button 
                      size="sm"
                      disabled={opportunity.has_applied || applying[opportunity.id]}
                      onClick={() => handleApply(opportunity.id)}
                      className="flex-1"
                    >
                      {applying[opportunity.id] ? 'Applying...' : 
                       opportunity.has_applied ? 'Applied' : 'Apply Now'}
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {opportunity.applications_count || 0} applications
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Opportunities;
