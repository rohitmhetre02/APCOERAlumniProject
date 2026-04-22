import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BriefcaseIcon,
  CalendarIcon,
  NewspaperIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const [stats, setStats] = useState({
    opportunities: 0,
    events: 0,
    news: 0,
    myPosts: 0
  });
  const [recentActivity, setRecentActivity] = useState({
    myOpportunities: [],
    myEvents: [],
    myApplications: [],
    myRegistrations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alumni_token');
      
      if (!token) {
        setError('Please login to view dashboard');
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [opportunitiesResponse, eventsResponse, newsResponse, myOpportunitiesResponse, myEventsResponse, myApplicationsResponse, myRegistrationsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/opportunities/approved`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/events/approved`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/news/approved`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/opportunities/my-opportunities`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
        fetch(`${import.meta.env.VITE_API_URL}/events/my-events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
        fetch(`${import.meta.env.VITE_API_URL}/applications/my-applications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
        fetch(`${import.meta.env.VITE_API_URL}/event-registrations/my-registrations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false, json: () => ({ data: [] }) }))
      ]);

      // Parse responses
      const opportunitiesData = opportunitiesResponse.ok ? await opportunitiesResponse.json() : { data: [] };
      const eventsData = eventsResponse.ok ? await eventsResponse.json() : { data: [] };
      const newsData = newsResponse.ok ? await newsResponse.json() : { data: [] };
      const myOpportunitiesData = myOpportunitiesResponse.ok ? await myOpportunitiesResponse.json() : { data: [] };
      const myEventsData = myEventsResponse.ok ? await myEventsResponse.json() : { data: [] };
      const myApplicationsData = myApplicationsResponse.ok ? await myApplicationsResponse.json() : { data: [] };
      const myRegistrationsData = myRegistrationsResponse.ok ? await myRegistrationsResponse.json() : { data: [] };

      // Calculate stats
      const newStats = {
        opportunities: opportunitiesData.data?.length || 0,
        events: eventsData.data?.length || 0,
        news: newsData.data?.length || 0,
        myPosts: (myOpportunitiesData.data?.length || 0) + (myEventsData.data?.length || 0)
      };

      setStats(newStats);
      
      // Set recent activity data
      setRecentActivity({
        myOpportunities: myOpportunitiesData.data?.slice(0, 3) || [], // Show latest 3
        myEvents: myEventsData.data?.slice(0, 3) || [], // Show latest 3
        myApplications: myApplicationsData.data?.slice(0, 3) || [], // Show latest 3
        myRegistrations: myRegistrationsData.data?.slice(0, 3) || [] // Show latest 3
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Available Opportunities',
      value: stats.opportunities,
      subtitle: 'Active job postings',
      icon: <BriefcaseIcon className="w-6 h-6" />,
      color: 'blue',
      action: () => navigate('/dashboard/opportunities')
    },
    {
      title: 'Upcoming Events',
      value: stats.events,
      subtitle: 'Events to attend',
      icon: <CalendarIcon className="w-6 h-6" />,
      color: 'green',
      action: () => navigate('/dashboard/events')
    },
    {
      title: 'Latest News',
      value: stats.news,
      subtitle: 'News articles',
      icon: <NewspaperIcon className="w-6 h-6" />,
      color: 'purple',
      action: () => navigate('/dashboard/news')
    },
    {
      title: 'My Posts',
      value: stats.myPosts,
      subtitle: 'Opportunities & Events',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      color: 'orange',
      action: () => navigate('/my-posts')
    }
  ];

  const getStatColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };
    return colors[color] || colors.blue;
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
      under_review: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ') || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your alumni dashboard</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={stat.action}>
            <div className="flex items-center justify-start">
              <div className={`p-3 rounded-lg ${getStatColorClasses(stat.color)}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.subtitle}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard/opportunities/add"
            className="block p-4 rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-blue-600 mb-2 group-hover:text-blue-700 transition-colors">
              <BriefcaseIcon className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Post Opportunity</h3>
            <p className="text-sm text-gray-600 mt-1">Share job opportunities with alumni</p>
          </Link>
          
          <Link
            to="/dashboard/events/add"
            className="block p-4 rounded-lg border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-green-600 mb-2 group-hover:text-green-700 transition-colors">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Add Event</h3>
            <p className="text-sm text-gray-600 mt-1">Organize alumni events and meetups</p>
          </Link>
          
          <Link
            to="/dashboard/profile"
            className="block p-4 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-purple-600 mb-2 group-hover:text-purple-700 transition-colors">
              <AcademicCapIcon className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Update Profile</h3>
            <p className="text-sm text-gray-600 mt-1">Keep your information up to date</p>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Posted Content */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Posted Content</h3>
          
          <div className="space-y-4">
            {/* My Opportunities */}
            {recentActivity.myOpportunities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Opportunities</h4>
                <div className="space-y-3">
                  {recentActivity.myOpportunities.map((opportunity) => (
                    <Link
                      key={opportunity.id}
                      to="/my-posts"
                      className="block"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`p-2 rounded-lg ${getStatColorClasses('purple')}`}>
                          <BriefcaseIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-gray-900">{opportunity.title}</h5>
                            {getStatusBadge(opportunity.status)}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{opportunity.company}</p>
                          <p className="text-gray-500 text-xs mt-2">Posted {formatDate(opportunity.created_at)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* My Events */}
            {recentActivity.myEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Events</h4>
                <div className="space-y-3">
                  {recentActivity.myEvents.map((event) => (
                    <Link
                      key={event.id}
                      to="/my-posts"
                      className="block"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`p-2 rounded-lg ${getStatColorClasses('green')}`}>
                          <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-gray-900">{event.title}</h5>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{event.event_date}</p>
                          <p className="text-gray-500 text-xs mt-2">Created {formatDate(event.created_at)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {recentActivity.myOpportunities.length === 0 && recentActivity.myEvents.length === 0 && (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posted content yet</h3>
                <p className="text-gray-500">Start by posting an opportunity or event.</p>
                <Link
                  to="/dashboard/opportunities/add"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 mt-4"
                >
                  Post Opportunity
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* My Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Activity</h3>
          
          <div className="space-y-4">
            {/* My Applications */}
            {recentActivity.myApplications.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Applications</h4>
                <div className="space-y-3">
                  {recentActivity.myApplications.map((application) => (
                    <Link
                      key={application.id}
                      to="/my-applications"
                      className="block"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`p-2 rounded-lg ${getStatColorClasses('blue')}`}>
                          <DocumentTextIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-gray-900">{application.title}</h5>
                            {getStatusBadge(application.status)}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{application.company}</p>
                          <p className="text-gray-500 text-xs mt-2">Applied {formatDate(application.applied_date)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* My Event Registrations */}
            {recentActivity.myRegistrations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Event Registrations</h4>
                <div className="space-y-3">
                  {recentActivity.myRegistrations.map((registration) => (
                    <Link
                      key={registration.id}
                      to="/my-events"
                      className="block"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`p-2 rounded-lg ${getStatColorClasses('green')}`}>
                          <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-gray-900">{registration.title}</h5>
                            {getStatusBadge(registration.status)}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{registration.event_date}</p>
                          <p className="text-gray-500 text-xs mt-2">Registered {formatDate(registration.registration_date)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {recentActivity.myApplications.length === 0 && recentActivity.myRegistrations.length === 0 && (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-500">Start exploring opportunities and events.</p>
                <Link
                  to="/dashboard/events"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 mt-4"
                >
                  Browse Events
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
