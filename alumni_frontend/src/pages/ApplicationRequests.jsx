import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  DocumentIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ApplicationRequests = () => {
  const { id: opportunityId } = useParams();
  const navigate = useNavigate();
  
    
  const [opportunity, setOpportunity] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch opportunity details and applications
  const fetchOpportunityApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alumni_token');
      
      if (!token) {
        setError('Please login to view applications');
        setLoading(false);
        return;
      }

      if (!opportunityId || opportunityId === 'undefined') {
        setError('Invalid opportunity ID. Please go back and try again.');
        setLoading(false);
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard/my-posts');
        }, 3000);
        return;
      }

      // Fetch opportunity details
      const opportunityResponse = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/${opportunityId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch applications for this opportunity
      const applicationsResponse = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/${opportunityId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!opportunityResponse.ok) throw new Error('Failed to fetch opportunity details');
      if (!applicationsResponse.ok) throw new Error('Failed to fetch applications');

      const opportunityData = await opportunityResponse.json();
      const applicationsData = await applicationsResponse.json();
      
      setOpportunity(opportunityData.data);
      setApplications(applicationsData.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      if (err.message.includes('404')) {
        setError('Opportunity not found');
      } else if (err.message.includes('403')) {
        setError('You do not have permission to view applications for this opportunity');
      } else {
        setError('Failed to fetch applications. Please try again later.');
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunityApplications();
  }, [opportunityId]);

  // Handle application actions
  const handleReview = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleAccept = async (applicationId) => {
    if (!window.confirm('Are you sure you want to accept this application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('alumni_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/applications/${applicationId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to accept application');

      const data = await response.json();
      setSuccess('Application accepted successfully!');
      
      // Update the application status in the list
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'accepted' }
          : app
      ));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (applicationId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    try {
      const token = localStorage.getItem('alumni_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/applications/${applicationId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason: reason })
      });

      if (!response.ok) throw new Error('Failed to reject application');

      const data = await response.json();
      setSuccess('Application rejected successfully!');
      
      // Update the application status in the list
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'rejected', rejection_reason: reason }
          : app
      ));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      reviewed: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'pending'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  // Show error state if opportunity ID is invalid
  if (!opportunityId || opportunityId === 'undefined') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Opportunity</h3>
          <p className="text-gray-500 mb-4">
            The opportunity ID is invalid or missing. Please go back and try again.
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
          <h1 className="text-2xl font-bold text-gray-900">Application Requests</h1>
          <p className="text-gray-600">Review and manage applications for your opportunity</p>
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

      {/* Opportunity Details */}
      {opportunity && (
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{opportunity.title}</h2>
                  {getStatusBadge(opportunity.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="text-sm font-medium text-gray-900">{opportunity.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">{opportunity.location || 'Remote'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="text-sm font-medium text-gray-900">{opportunity.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Applications</p>
                      <p className="text-sm font-medium text-gray-900">{applications.length}</p>
                    </div>
                  </div>
                </div>

                {opportunity.salary_range && (
                  <div className="flex items-center gap-2 mb-4">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Salary Range</p>
                      <p className="text-sm font-medium text-gray-900">{opportunity.salary_range}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{opportunity.description}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Applications List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Applications ({applications.length})
          </h3>
          
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500">
                Applications for this opportunity will appear here once submitted.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Education
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
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
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.applicant_first_name} {application.applicant_last_name}
                          </div>
                          <div className="text-sm text-gray-500">{application.applicant_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.applicant_phone ? (
                            <div className="flex items-center gap-1">
                              <PhoneIcon className="h-4 w-4 text-gray-400" />
                              {application.applicant_phone}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not provided</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.applicant_education ? (
                            <div className="flex items-center gap-1">
                              <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                              {application.applicant_education}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not provided</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReview(application)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Review Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          {application.status !== 'accepted' && (
                            <button
                              onClick={() => handleAccept(application.id)}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                              title="Accept Application"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {application.status !== 'rejected' && (
                            <button
                              onClick={() => handleReject(application.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                              title="Reject Application"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
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

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Applicant Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedApplication.applicant_first_name} {selectedApplication.applicant_last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedApplication.applicant_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedApplication.applicant_phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Education</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedApplication.applicant_education || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Application Message */}
                {selectedApplication.message && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Application Message</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedApplication.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Resume/CV */}
                {selectedApplication.resume_url && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Resume/CV</h4>
                    <a
                      href={selectedApplication.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <DocumentIcon className="h-5 w-5" />
                      View Resume/CV
                    </a>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedApplication.rejection_reason && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason</h4>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-700">
                        {selectedApplication.rejection_reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </Button>
                  
                  {selectedApplication.status !== 'accepted' && (
                    <Button
                      onClick={() => {
                        handleAccept(selectedApplication.id);
                        setShowDetailModal(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                  )}
                  
                  {selectedApplication.status !== 'rejected' && (
                    <Button
                      onClick={() => {
                        handleReject(selectedApplication.id);
                        setShowDetailModal(false);
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationRequests;
