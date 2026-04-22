import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const NotificationsPage = ({ isOpen = true, onClose }) => {

  // Mock notification data
  const notifications = {
    today: [
      {
        id: 1,
        icon: '👤',
        initial: 'JD',
        title: 'John Doe sent you a connection request',
        subtitle: 'Senior Software Engineer at Tech Solutions Inc.',
        time: '2h ago',
        unread: true
      },
      {
        id: 2,
        icon: '💼',
        initial: 'TS',
        title: 'New job opportunity matching your profile',
        subtitle: 'Frontend Developer at Google',
        time: '4h ago',
        unread: true
      },
      {
        id: 3,
        icon: '📅',
        initial: 'AM',
        title: 'Reminder: Alumni Meet 2024',
        subtitle: 'Starting in 2 days at APCOER Campus',
        time: '6h ago',
        unread: false
      }
    ],
    earlier: [
      {
        id: 4,
        icon: '🎓',
        initial: 'AS',
        title: 'You have a new profile view',
        subtitle: 'Jane Smith viewed your profile',
        time: '1d ago',
        unread: false
      },
      {
        id: 5,
        icon: '💬',
        initial: 'MS',
        title: 'New comment on your post',
        subtitle: '"Great insights on cloud technologies!"',
        time: '2d ago',
        unread: false
      },
      {
        id: 6,
        icon: '🏆',
        initial: 'TC',
        title: 'Achievement unlocked',
        subtitle: 'You are now in top 10% contributors',
        time: '3d ago',
        unread: false
      },
      {
        id: 7,
        icon: '📰',
        initial: 'AA',
        title: 'New article published',
        subtitle: 'APCOER Alumni Success Stories',
        time: '5d ago',
        unread: false
      },
      {
        id: 8,
        icon: '🔔',
        initial: 'SY',
        title: 'System update',
        subtitle: 'New features added to the portal',
        time: '1w ago',
        unread: false
      }
    ]
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
      />
      
      {/* Notifications Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Today Section */}
          <div className="border-b border-gray-100">
            <div className="px-6 py-3 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Today</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {notifications.today.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.unread ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    
                    {/* Left Side - Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notification.unread 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {notification.icon || (
                        <span className="text-sm font-semibold">
                          {notification.initial}
                        </span>
                      )}
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-semibold ${
                            notification.unread ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {notification.subtitle && (
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.subtitle}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earlier Section */}
          <div>
            <div className="px-6 py-3 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Earlier</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {notifications.earlier.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.unread ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    
                    {/* Left Side - Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notification.unread 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {notification.icon || (
                        <span className="text-sm font-semibold">
                          {notification.initial}
                        </span>
                      )}
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-semibold ${
                            notification.unread ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {notification.subtitle && (
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.subtitle}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Mark all as read
            </button>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              Clear all
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
