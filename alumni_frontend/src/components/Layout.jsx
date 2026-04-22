import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 min-h-screen ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'} relative md:absolute md:inset-0`}>
        {/* Topbar */}
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Page Content */}
        <main className="p-6 pt-24 relative md:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
