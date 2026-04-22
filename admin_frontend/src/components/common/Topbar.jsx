import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { 
  BellIcon, 
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Topbar = ({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, isSidebarHovered, setIsSidebarHovered }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { logout, user } = useAuth();
  const { unreadCount, socketConnected } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileDropdown(false);
  };

  const getDashboardTitle = () => {
    if (user?.role === 'coordinator') {
      return 'Coordinator Dashboard';
    }
    return 'Admin Dashboard';
  };

  const getNotificationsPath = () => {
    if (user?.role === 'coordinator') {
      return '/coordinator/notifications';
    }
    return '/admin/notifications';
  };

  const getMessagesPath = () => {
    if (user?.role === 'coordinator') {
      return '/coordinator/messages';
    }
    return '/admin/messages';
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Toggle Icon and Title */}
        <div className="flex items-center space-x-2">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
          
          {/* Desktop Collapse Toggle */}
          <div 
            className="hidden lg:flex"
            onMouseEnter={() => sidebarCollapsed && setIsSidebarHovered(true)}
            onMouseLeave={() => sidebarCollapsed && setIsSidebarHovered(false)}
          >
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="w-5 h-5" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <h1 className="text-xl font-semibold text-gray-800">{getDashboardTitle()}</h1>
        </div>
        
        {/* Right side - Icons */}
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <Link 
            to={getNotificationsPath()}
            className={`relative p-2 hover:bg-gray-100 rounded-lg transition-colors ${
              unreadCount > 0 ? (user?.role === 'coordinator' ? 'text-green-600' : 'text-blue-600') : 'text-gray-600'
            }`}
            title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {socketConnected && (
              <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full" title="Connected"></span>
            )}
          </Link>
          
          {/* Message Icon */}
          <Link 
            to={getMessagesPath()}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
