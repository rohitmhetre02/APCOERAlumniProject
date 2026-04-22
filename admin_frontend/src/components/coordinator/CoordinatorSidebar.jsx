import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  BriefcaseIcon,
  NewspaperIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import ProfileDropdown from '../common/ProfileDropdown';

const CoordinatorSidebar = ({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, isSidebarHovered, setIsSidebarHovered }) => {
  const location = useLocation();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const handleMenuClick = () => {
    // Auto-close sidebar on mobile after clicking a menu item
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const effectiveCollapsed = sidebarCollapsed && !isSidebarHovered;

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/coordinator/dashboard',
      icon: <HomeIcon className="w-5 h-5" />
    },
    {
      name: 'Profile Approval',
      path: '/coordinator/profile-approval',
      icon: <CheckCircleIcon className="w-5 h-5" />
    },
    {
      name: 'Alumni Management',
      path: '/coordinator/users/alumni',
      icon: <UserGroupIcon className="w-5 h-5" />
    },
    {
      name: 'Events Management',
      path: '/coordinator/manage/events',
      icon: <CalendarIcon className="w-5 h-5" />
    },
    {
      name: 'Opportunities',
      path: '/coordinator/manage/opportunities',
      icon: <BriefcaseIcon className="w-5 h-5" />
    },
    {
      name: 'News Management',
      path: '/coordinator/manage/news',
      icon: <NewspaperIcon className="w-5 h-5" />
    },
    {
      name: 'Gallery',
      path: '/coordinator/gallery',
      icon: <PhotoIcon className="w-5 h-5" />
    },
    {
      name: 'Messages',
      path: '/coordinator/messages',
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />
    }
  ];

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (submenu) => submenu.some(item => location.pathname === item.path);

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Coordinator Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-screen bg-white shadow-lg z-40 flex flex-col transform transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          effectiveCollapsed ? 'w-16' : 'w-72'
        }`}
        onMouseEnter={() => sidebarCollapsed && setIsSidebarHovered(true)}
        onMouseLeave={() => sidebarCollapsed && setIsSidebarHovered(false)}
      >
        {/* Logo */}
        <div className={`flex items-center justify-between border-b border-gray-200 ${
          effectiveCollapsed ? 'p-2' : 'p-3'
        }`}>
          <div className={`flex items-center ${effectiveCollapsed ? '' : 'gap-3'}`}>
            <div className={`bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 ${
              effectiveCollapsed ? 'w-6 h-6' : 'w-8 h-8'
            }`}>
              <span className={`text-white font-bold ${
                effectiveCollapsed ? 'text-xs' : 'text-sm'
              }`}>C</span>
            </div>
            <div className={`transition-all duration-300 ${effectiveCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              <h1 className="text-lg font-semibold text-gray-800 whitespace-nowrap">Coordinator Panel</h1>
              <p className="text-xs text-gray-500 whitespace-nowrap">APCOER Alumni</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Collapse Toggle Button - Desktop Only */}
            <div 
              className="hidden lg:flex"
              onMouseEnter={() => sidebarCollapsed && setIsSidebarHovered(true)}
              onMouseLeave={() => sidebarCollapsed && setIsSidebarHovered(false)}
            >
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronRightIcon className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                  !sidebarCollapsed ? 'rotate-180' : ''
                }`} />
              </button>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto ${
          effectiveCollapsed ? 'p-1 space-y-0.5' : 'p-2 space-y-1'
        }`}>
          {menuItems.map((item, index) => (
            <div key={item.name}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => !effectiveCollapsed && toggleSubmenu(index)}
                    className={`w-full flex items-center justify-between rounded-lg transition-all duration-200 ${
                      isSubmenuActive(item.submenu)
                        ? 'bg-green-50 text-green-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    } group ${
                      effectiveCollapsed ? 'p-1.5' : 'p-2.5'
                    }`}
                    title={effectiveCollapsed ? item.name : ''}
                  >
                    <div className={`flex items-center ${
                      effectiveCollapsed ? 'justify-center' : 'gap-1'
                    }`}>
                      <div className={effectiveCollapsed ? 'w-5 h-5' : ''}>
                        {item.icon}
                      </div>
                      <span className={`font-medium transition-all duration-300 ${
                        effectiveCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                    {!effectiveCollapsed && (
                      <div className="transition-transform duration-200">
                        {activeSubmenu === index ? (
                          <ChevronDownIcon className="w-4 h-4" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </button>
                  
                  {!effectiveCollapsed && activeSubmenu === index && (
                    <div className="ml-4 mt-1.5 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={handleMenuClick}
                          className={`block p-2 rounded-md text-sm transition-colors ${
                            isActive(subItem.path)
                              ? 'bg-green-100 text-green-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={handleMenuClick}
                  className={`flex items-center rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  } group ${
                    effectiveCollapsed ? 'p-1.5' : 'p-2.5'
                  }`}
                  title={effectiveCollapsed ? item.name : ''}
                >
                  <div className={`flex items-center ${
                    effectiveCollapsed ? 'justify-center' : 'gap-1'
                  }`}>
                    <div className={effectiveCollapsed ? 'w-5 h-5' : ''}>
                      {item.icon}
                    </div>
                    <span className={`font-medium transition-all duration-300 ${
                      effectiveCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    }`}>
                      {item.name}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="border-t border-gray-200">
          <div className={`transition-all duration-300 ${effectiveCollapsed ? 'p-2' : 'p-3'}`}>
            <ProfileDropdown collapsed={effectiveCollapsed} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CoordinatorSidebar;
