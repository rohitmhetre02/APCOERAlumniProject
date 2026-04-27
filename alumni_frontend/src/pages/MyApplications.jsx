import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { 
  BriefcaseIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alumni_token');
      
      
      
      if (!token) {
        setError('Please login to view your applications');
        setLoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_API_URL}/applications/my-applications`;
     
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      
      const data = await response.json();
      

      if (data.success) {
       
        setApplications(data.data);
      } else {
       
        setError(data.message || 'Failed to fetch applications');
      }
    } catch (err) {
    
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'under_review': 'bg-blue-100 text-blue-800',
      'shortlisted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'accepted': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const handleTrackApplication = (application) => {
    setSelectedApplication(application);
    setShowTrackingModal(true);
  };

  const getProgressSteps = (status) => {
    let steps = [
      { name: 'Application Submitted', completed: true, icon: '✓' },
      { name: 'Under Review', completed: ['under_review', 'accepted', 'rejected'].includes(status), icon: '✓' }
    ];
    
    // Add Accepted step only if not rejected
    if (status !== 'rejected') {
      steps.push({ name: 'Accepted', completed: status === 'accepted', icon: '✓' });
    }
    
    // Add Rejected step only if rejected
    if (status === 'rejected') {
      steps.push({ name: 'Rejected', completed: true, icon: '✓' });
    }
    
    return steps;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track your job applications and their status</p>
        </div>

        {/* Summary Statistics - Responsive */}
        {applications.length > 0 && (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              {/* Mobile Stack Layout */}
              <div className="block sm:hidden">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 rounded-lg p-2 mr-3">
                    <BriefcaseIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Total Applications
                    </div>
                    <div className="text-xs text-gray-500">
                      {applications.length} application{applications.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="text-lg font-bold text-yellow-600">
                      {applications.filter(app => app.status === 'pending').length}
                    </div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-600">
                      {applications.filter(app => app.status === 'under_review').length}
                    </div>
                    <div className="text-xs text-gray-500">Under Review</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="text-lg font-bold text-green-600">
                      {applications.filter(app => app.status === 'accepted').length}
                    </div>
                    <div className="text-xs text-gray-500">Accepted</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="text-lg font-bold text-red-600">
                      {applications.filter(app => app.status === 'rejected').length}
                    </div>
                    <div className="text-xs text-gray-500">Rejected</div>
                  </div>
                </div>
              </div>

              {/* Desktop Horizontal Layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-600 rounded-lg p-2 mr-3">
                    <BriefcaseIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Total Applications
                    </div>
                    <div className="text-xs text-gray-500">
                      {applications.length} application{applications.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-6 lg:space-x-8">
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">
                      {applications.filter(app => app.status === 'pending').length}
                    </div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {applications.filter(app => app.status === 'under_review').length}
                    </div>
                    <div className="text-xs text-gray-500">Under Review</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {applications.filter(app => app.status === 'accepted').length}
                    </div>
                    <div className="text-xs text-gray-500">Accepted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {applications.filter(app => app.status === 'rejected').length}
                    </div>
                    <div className="text-xs text-gray-500">Rejected</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BriefcaseIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Start applying to opportunities to track them here</p>
            <button 
              onClick={() => window.location.href = '/dashboard/opportunities'}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Browse Opportunities
            </button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opportunity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resume
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Track
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.opportunity_title}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="h-px bg-gray-300 w-4 mr-2"></div>
                            {application.job_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{application.company}</div>
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">{application.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {new Date(application.applied_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.resume_url ? (
                        <a
                          href={application.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          Resume
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No resume</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleTrackApplication(application)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Track Application
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Application Progress</h3>
                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Opportunity Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedApplication.opportunity_title}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Company:</span>
                    <span className="ml-2 text-gray-900">{selectedApplication.company}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 text-gray-900">{selectedApplication.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 text-gray-900">{selectedApplication.job_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Applied:</span>
                    <span className="ml-2 text-gray-900">{new Date(selectedApplication.applied_date).toLocaleDateString()}</span>
                  </div>
                </div>
                {selectedApplication.salary_range && (
                  <div className="mt-2">
                    <span className="text-gray-500">Salary Range:</span>
                    <span className="ml-2 text-gray-900">{selectedApplication.salary_range}</span>
                  </div>
                )}
              </div>

              {/* Progress Tracker - Horizontal */}
<div className="mb-8">
  <h2 className="text-lg font-semibold mb-4">Application Status</h2>

  <div className="flex items-center justify-between relative">
    {getProgressSteps(selectedApplication.status).map((step, index, arr) => {
      
      const isRejected = selectedApplication.status === "rejected";

      return (
        <div key={index} className="flex-1 flex flex-col items-center relative">

          {/* Line */}
          {index !== arr.length - 1 && (
            <div
              className={`absolute top-3 left-1/2 w-full h-1 ${
                step.completed
                  ? isRejected
                    ? "bg-red-500"
                    : "bg-green-500"
                  : "bg-gray-300"
              }`}
            ></div>
          )}

          {/* Circle */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
              step.completed
                ? isRejected
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
                : "bg-gray-300 text-gray-500"
            }`}
          >
            {step.completed && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Label */}
          <span
            className={`mt-2 text-sm text-center ${
              step.completed
                ? isRejected
                  ? "text-red-500 font-medium"
                  : "text-black font-medium"
                : "text-gray-400"
            }`}
          >
            {step.name}
          </span>
        </div>
      );
    })}
  </div>
</div>

              {/* Current Status */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Current Status</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      Your application is currently <span className="font-semibold">{getStatusBadge(selectedApplication.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proposal if exists */}
              {selectedApplication.proposal && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Your Proposal</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{selectedApplication.proposal}</p>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MyApplications;
