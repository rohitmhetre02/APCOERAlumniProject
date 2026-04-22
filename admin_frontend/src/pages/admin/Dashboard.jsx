import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserGroupIcon,
  CalendarIcon,
  BriefcaseIcon,
  NewspaperIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate stats for display
  const getStats = () => {
    if (!dashboardData) return [];

    const { users, events, opportunities, news, pendingApprovals } = dashboardData;
    
    return [
      {
        title: 'Total Alumni',
        value: users?.total_alumni?.toLocaleString() || '0',
        icon: <UserGroupIcon className="w-6 h-6" />,
        color: 'blue',
        details: {
          approved: users?.approved_alumni || 0,
          pending: users?.pending_users || 0
        }
      },
      {
        title: 'Total Events',
        value: events?.total_events?.toLocaleString() || '0',
        icon: <CalendarIcon className="w-6 h-6" />,
        color: 'green',
        details: {
          approved: events?.approved_events || 0,
          pending: events?.pending_events || 0
        }
      },
      {
        title: 'Job Opportunities',
        value: opportunities?.total_opportunities?.toLocaleString() || '0',
        icon: <BriefcaseIcon className="w-6 h-6" />,
        color: 'purple',
        details: {
          active: opportunities?.active_opportunities || 0,
          pending: opportunities?.pending_opportunities || 0,
          applications: opportunities?.total_applications || 0
        }
      },
      {
        title: 'News Articles',
        value: news?.total_news?.toLocaleString() || '0',
        icon: <NewspaperIcon className="w-6 h-6" />,
        color: 'orange',
        details: {
          approved: news?.approved_news || 0
        }
      }
    ];
  };

  // Get recent activities (mock data for now, can be enhanced later)
  const getRecentActivities = () => {
    if (!dashboardData) return [];

    const { pendingApprovals } = dashboardData;
    const activities = [];
    
    if (pendingApprovals?.pending_events > 0) {
      activities.push({
        id: 1,
        type: 'event_pending',
        title: 'Pending Event Approvals',
        description: `${pendingApprovals.pending_events} events waiting for approval`,
        time: 'Recently',
        status: 'pending'
      });
    }
    
    if (pendingApprovals?.pending_opportunities > 0) {
      activities.push({
        id: 2,
        type: 'opportunity_pending',
        title: 'Pending Opportunity Approvals',
        description: `${pendingApprovals.pending_opportunities} opportunities waiting for approval`,
        time: 'Recently',
        status: 'pending'
      });
    }
    
    if (pendingApprovals?.draft_news > 0) {
      activities.push({
        id: 3,
        type: 'news_draft',
        title: 'Draft News Articles',
        description: `${pendingApprovals.draft_news} news articles in draft`,
        time: 'Recently',
        status: 'pending'
      });
    }
    
    if (pendingApprovals?.pending_alumni > 0) {
      activities.push({
        id: 4,
        type: 'alumni_pending',
        title: 'Pending Alumni Approvals',
        description: `${pendingApprovals.pending_alumni} alumni profiles waiting for approval`,
        time: 'Recently',
        status: 'pending'
      });
    }
    
    return activities;
  };

  // Quick actions
  const quickActions = [
    {
      title: 'Create Event',
      description: 'Add new event to calendar',
      icon: <CalendarIcon className="w-8 h-8" />,
      link: '/admin/manage/events',
      color: 'blue'
    },
    {
      title: 'Post Opportunity',
      description: 'Add new job opportunity',
      icon: <BriefcaseIcon className="w-8 h-8" />,
      link: '/admin/manage/opportunities',
      color: 'green'
    },
    {
      title: 'Publish News',
      description: 'Create news article',
      icon: <NewspaperIcon className="w-8 h-8" />,
      link: '/admin/manage/news',
      color: 'purple'
    },
    {
      title: 'Content Approval',
      description: 'Review pending content',
      icon: <CheckCircleIcon className="w-8 h-8" />,
      link: '/admin/content-approval',
      color: 'orange'
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

  const getActivityIcon = (type) => {
    const icons = {
      event_pending: <CalendarIcon className="w-5 h-5" />,
      opportunity_pending: <BriefcaseIcon className="w-5 h-5" />,
      news_draft: <NewspaperIcon className="w-5 h-5" />,
      alumni_pending: <UserGroupIcon className="w-5 h-5" />
    };
    return icons[type] || <ClockIcon className="w-5 h-5" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      approved: 'text-green-600 bg-green-50',
      rejected: 'text-red-600 bg-red-50'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">Error loading dashboard: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const recentActivities = getRecentActivities();
  const totalPendingApprovals = Object.values(dashboardData?.pendingApprovals || {}).reduce((sum, count) => sum + parseInt(count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor your admin dashboard metrics and activities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-start">
              <div className={`p-3 rounded-lg ${getStatColorClasses(stat.color)}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
              {stat.details && (
                <div className="mt-2 text-xs text-gray-500">
                  {Object.entries(stat.details).map(([key, value]) => (
                    <span key={key} className="mr-3">
                      {key}: {value.toLocaleString()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      
      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`p-4 rounded-lg border-2 border-dashed hover:border-solid transition-colors cursor-pointer ${
                action.color === 'blue' ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50' :
                action.color === 'green' ? 'border-green-300 hover:border-green-500 hover:bg-green-50' :
                action.color === 'purple' ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50' :
                'border-orange-300 hover:border-orange-500 hover:bg-orange-50'
              }`}
            >
              <div className={`text-${action.color}-600 mb-2`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{action.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </Card>

      {/* Recent Activities */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          <Link
            to="/admin/content-approval"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        </div>
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <Link
                key={activity.id}
                to={
                  activity.type === 'alumni_pending' ? '/admin/profile-approval' :
                  activity.type === 'event_pending' ? '/admin/content-approval?tab=events' :
                  activity.type === 'opportunity_pending' ? '/admin/content-approval?tab=opportunities' :
                  activity.type === 'news_draft' ? '/admin/content-approval?tab=news' :
                  '/admin/content-approval'
                }
                className="block"
              >
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`p-2 rounded-lg ${getStatColorClasses(
                    activity.type === 'alumni_pending' ? 'blue' :
                    activity.type === 'event_pending' ? 'green' :
                    activity.type === 'opportunity_pending' ? 'purple' :
                    'orange'
                  )}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                    <p className="text-gray-500 text-xs mt-2">{activity.time}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No pending activities to review.</p>
          </div>
        )}
      </Card>

      {/* Pending Approvals Alert */}
      {totalPendingApprovals > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Pending Approvals</h3>
              <p className="text-yellow-700 text-sm mt-1">
                You have {totalPendingApprovals} items pending approval. 
                <Link to="/admin/content-approval" className="underline font-medium ml-1">
                  Review now
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
