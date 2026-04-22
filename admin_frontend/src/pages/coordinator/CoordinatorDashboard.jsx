import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  BellIcon,
  ChartBarIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAlumni: 0,
    activeAlumni: 0,
    recentRegistrations: 0,
    pendingApprovals: 0,
    departmentEvents: 0,
    departmentOpportunities: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch coordinator dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('admin_token');
      console.log('Fetching coordinator dashboard stats...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coordinators/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      console.log('Dashboard API response:', data);
      
      const apiStats = data.stats || {};
      console.log('Parsed stats:', apiStats);
      
      const newStats = {
        totalAlumni: apiStats.totalAlumni || 0,
        activeAlumni: apiStats.activeAlumni || 0,
        recentRegistrations: apiStats.recentRegistrations || 0,
        pendingApprovals: apiStats.pendingApprovals || 0,
        departmentEvents: apiStats.departmentEvents?.total || 0,
        departmentOpportunities: apiStats.departmentOpportunities?.total || 0
      };
      
      console.log('Setting stats:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats for display
  const getStats = () => {
    return [
      {
        title: 'Department Alumni',
        value: stats.totalAlumni.toLocaleString(),
        icon: <UserGroupIcon className="w-6 h-6" />,
        color: 'blue',
        details: {
          active: stats.activeAlumni,
          recent: stats.recentRegistrations
        }
      },
      {
        title: 'Department Events',
        value: stats.departmentEvents.toLocaleString(),
        icon: <CalendarIcon className="w-6 h-6" />,
        color: 'green'
      },
      {
        title: 'Department Opportunities',
        value: stats.departmentOpportunities.toLocaleString(),
        icon: <BriefcaseIcon className="w-6 h-6" />,
        color: 'purple'
      },
      {
        title: 'Profile Approval',
        value: stats.pendingApprovals.toLocaleString(),
        icon: <CheckCircleIcon className="w-6 h-6" />,
        color: 'orange',
        details: {
          pending: stats.pendingApprovals
        }
      }
    ];
  };

  // Get recent activities
  const getRecentActivities = () => {
    const activities = [];
    
    if (stats.pendingApprovals > 0) {
      activities.push({
        id: 1,
        type: 'alumni_pending',
        title: 'Pending Alumni Approvals',
        description: `${stats.pendingApprovals} alumni profiles waiting for approval`,
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
      link: '/coordinator/manage/events',
      color: 'blue'
    },
    {
      title: 'Post Opportunity',
      description: 'Add new job opportunity',
      icon: <BriefcaseIcon className="w-8 h-8" />,
      link: '/coordinator/manage/opportunities',
      color: 'green'
    },
    {
      title: 'Profile Approval',
      description: 'Review pending profile',
      icon: <CheckCircleIcon className="w-8 h-8" />,
      link: '/coordinator/profile-approval',
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
            <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
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

  const statsData = getStats();
  const recentActivities = getRecentActivities();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.department} Coordinator Dashboard
          </h1>
          <p className="text-gray-600">Monitor your department metrics and activities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`p-4 rounded-lg border-2 border-dashed hover:border-solid transition-colors cursor-pointer ${
                action.color === 'blue' ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50' :
                action.color === 'green' ? 'border-green-300 hover:border-green-500 hover:bg-green-50' :
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
            to="/coordinator/profile-approval"
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
                to="/coordinator/profile-approval"
                className="block"
              >
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`p-2 rounded-lg ${getStatColorClasses('blue')}`}>
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
      {stats.pendingApprovals > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Pending Approvals</h3>
              <p className="text-yellow-700 text-sm mt-1">
                You have {stats.pendingApprovals} alumni profiles pending approval. 
                <Link to="/coordinator/profile-approval" className="underline font-medium ml-1">
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

export default CoordinatorDashboard;
