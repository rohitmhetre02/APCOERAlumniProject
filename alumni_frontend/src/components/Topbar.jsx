import { useState, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from "react-router-dom";
import { BellIcon, ChatBubbleLeftRightIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NotificationsPage from '../pages/NotificationsPage';

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mock unread count - replace with actual notification context
  const [unreadCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <Fragment>
      <div className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-16">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left side - Toggle Icon and Title */}
          <div className="flex items-center space-x-4">
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
            
            <h2 className="text-lg font-semibold text-gray-800">Welcome back, {user?.firstName || 'User'}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <button 
              onClick={() => setShowNotifications(true)}
              className={`relative p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'
              }`}
              title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Message Icon */}
            <Link 
              to="/dashboard/messages"
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Notifications Modal */}
      {showNotifications && (
        <NotificationsPage 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
      )}
    </Fragment>
  );
};

export default Topbar;
