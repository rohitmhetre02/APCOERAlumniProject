import { useState, Fragment, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessageContext';
import { Link, useNavigate } from "react-router-dom";
import { ChatBubbleLeftRightIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const { socketConnected, markAsRead } = useMessages();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Read unread counts from localStorage (sync with Messages page)
  useEffect(() => {
    const updateUnreadCount = () => {
      try {
        const savedCounts = localStorage.getItem('alumni_unread_counts');
        if (savedCounts) {
          const counts = JSON.parse(savedCounts);
          const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
          setUnreadCount(total);
        } else {
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Error reading unread counts:', error);
        setUnreadCount(0);
      }
    };

    updateUnreadCount();
    
    // Update every second to sync with Messages page
    const interval = setInterval(updateUnreadCount, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Custom markAsRead that clears localStorage
  const handleMarkAsRead = () => {
    localStorage.removeItem('alumni_unread_counts');
    setUnreadCount(0);
    if (markAsRead) markAsRead();
  };

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
            {/* Message Icon */}
            <Link 
              to="/dashboard/messages"
              onClick={handleMarkAsRead}
              className={`relative p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'
              }`}
              title={`Messages ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {socketConnected && (
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full" title="Connected"></span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Topbar;
