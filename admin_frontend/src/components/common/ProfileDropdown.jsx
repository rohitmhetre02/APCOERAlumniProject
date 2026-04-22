import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  UserCircleIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const ProfileDropdown = ({ collapsed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    // Navigate to profile based on user role
    if (user?.role === 'coordinator') {
      navigate('/coordinator/profile');
    } else {
      navigate('/admin/profile');
    }
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    // Navigate to settings based on user role
    if (user?.role === 'coordinator') {
      navigate('/coordinator/settings');
    } else {
      navigate('/admin/settings');
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getRoleColor = () => {
    return user?.role === 'coordinator' ? 'bg-green-600' : 'bg-blue-600';
  };

  const getRoleLabel = () => {
    return user?.role === 'coordinator' ? 'Coordinator' : 'Administrator';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Section */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center cursor-pointer hover:bg-gray-100 transition-colors rounded-lg ${
          collapsed 
            ? 'justify-center p-1.5 mx-auto' 
            : 'justify-between p-3 mx-2 mb-2'
        }`}
        title={collapsed ? (user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user?.role === 'coordinator' ? 'Coordinator' : 'Admin'
        ) : ''}
      >
        <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
          <div className={`${getRoleColor()} rounded-full flex items-center justify-center flex-shrink-0 ${
            collapsed ? 'w-7 h-7' : 'w-10 h-10'
          }`}>
            {user?.firstName ? (
              <span className={`text-white font-medium ${
                collapsed ? 'text-sm' : 'text-lg'
              }`}>
                {user.firstName.charAt(0)}{user.lastName?.charAt(0)}
              </span>
            ) : (
              <UserCircleIcon className={`${collapsed ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.role === 'coordinator' ? 'Coordinator' : 'Admin'
                }
              </p>
              <p className="text-xs text-gray-500 truncate">{getRoleLabel()}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Cog6ToothIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute bottom-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 ${
          collapsed 
            ? 'left-1/2 transform -translate-x-1/2 mb-2 w-48' 
            : 'left-2 right-2 mb-2'
        }`}>
          <button
            onClick={handleProfileClick}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <UserCircleIcon className="w-4 h-4 mr-3 text-gray-500" />
            Profile
          </button>
          <button
            onClick={handleSettingsClick}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-500" />
            Settings
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
