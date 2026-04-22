import React, { useState } from 'react';
import CoordinatorSidebar from '../components/coordinator/CoordinatorSidebar';
import Topbar from '../components/common/Topbar';

const CoordinatorLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Coordinator Sidebar */}
      <CoordinatorSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        isSidebarHovered={isSidebarHovered}
        setIsSidebarHovered={setIsSidebarHovered}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarOpen 
          ? sidebarCollapsed && !isSidebarHovered
            ? 'lg:ml-16' 
            : 'lg:ml-72'
          : 'lg:ml-0'
      } ml-0`}>
        {/* Coordinator Topbar */}
        <Topbar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          isSidebarHovered={isSidebarHovered}
          setIsSidebarHovered={setIsSidebarHovered}
        />
        
        {/* Page Content */}
        <main className="p-6 pt-20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CoordinatorLayout;
