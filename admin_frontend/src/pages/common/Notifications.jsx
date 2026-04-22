import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  UserIcon,
  ClockIcon,
  ArrowPathIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Notifications = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    socketConnected,
    markAsRead, 
    markAllAsRead,
    refreshNotifications 
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotification, setSelectedNotification] = useState(null);

  const filteredNotifications = (notifications || []).filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate to approval page if it's an approval notification
    if (notification.type === 'approval') {
      navigate('/coordinator/profile-approval');
    }
  };

  const handleApprovalAction = () => {
    // Navigate to approval page if it's an approval notification
    if (selectedNotification && selectedNotification.type === 'approval') {
      navigate('/coordinator/profile-approval');
    }
  };

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approval':
        return <UserIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'bg-gray-50 border-gray-200';
    switch (type) {
      case 'approval':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  // Group notifications by time
  const groupedNotifications = (notifications || []).reduce((groups, notification) => {
    const now = new Date();
    const notificationDate = new Date(notification.created_at);
    const diffInHours = (now - notificationDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      groups.today.push(notification);
    } else {
      groups.earlier.push(notification);
    }
    return groups;
  }, { today: [], earlier: [] });

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20"
        onClick={() => navigate('/admin/dashboard')}
      />
      
      {/* Notifications Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
            <div className="flex items-center space-x-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-gray-600">
                {socketConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshNotifications}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (!notifications || notifications.length === 0) ? (
            <div className="text-center py-12">
              <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <>
              {/* Today Section */}
              {groupedNotifications.today.length > 0 && (
                <div className="border-b border-gray-100">
                  <div className="px-6 py-3 bg-gray-50">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Today</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {groupedNotifications.today.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.is_read ? 'bg-blue-50' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          
                          {/* Left Side - Icon */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            !notification.is_read 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Right Side - Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-bold ${
                                  !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.type === 'approval' ? 'Approval Required' : 'System Notification'}
                                </h3>
                                <p className="text-sm text-gray-800 mt-1 font-medium">
                                  {notification.message}
                                </p>
                                {notification.type === 'approval' && (
                                  <div className="mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                      Approval Required
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">
                                      Click to review and approve
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                                {!notification.is_read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Mark as read"
                                  >
                                    <CheckIcon className="w-4 h-4" />
                                  </button>
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatTime(notification.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Earlier Section */}
              {groupedNotifications.earlier.length > 0 && (
                <div>
                  <div className="px-6 py-3 bg-gray-50">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Earlier</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {groupedNotifications.earlier.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.is_read ? 'bg-blue-50' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          
                          {/* Left Side - Icon */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            !notification.is_read 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Right Side - Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-bold ${
                                  !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.type === 'approval' ? 'Approval Required' : 'System Notification'}
                                </h3>
                                <p className="text-sm text-gray-800 mt-1 font-medium">
                                  {notification.message}
                                </p>
                                {notification.type === 'approval' && (
                                  <div className="mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                      Approval Required
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">
                                      Click to review and approve
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                                {!notification.is_read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Mark as read"
                                  >
                                    <CheckIcon className="w-4 h-4" />
                                  </button>
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatTime(notification.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark all as read
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{unreadCount} unread</span>
              <span>•</span>
              <span>{notifications.length} total</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;
