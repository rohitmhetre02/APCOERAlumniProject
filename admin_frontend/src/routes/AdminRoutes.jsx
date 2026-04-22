import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Layout
import AdminLayout from '../components/layout/AdminLayout';

// Import Pages
import Dashboard from '../pages/dashboard/Dashboard';
import Login from '../pages/Login';
import Events from '../pages/common/events/Events';
import AddEvent from '../pages/common/events/AddEvent';
import EditEvent from '../pages/common/events/EditEvent';
import EventRegistrations from '../pages/common/events/EventRegistrations';
import Opportunities from '../pages/common/opportunities/Opportunities';
import AddOpportunity from '../pages/common/opportunities/AddOpportunity';
import OpportunityApplications from '../pages/common/opportunities/OpportunityApplications';
import News from '../pages/common/news/News';
import AddNews from '../pages/common/news/AddNews';
import ProfileApproval from '../pages/coordinator/ProfileApproval';
import ContentApproval from '../pages/admin/ContentApproval';
import AlumniList from '../pages/common/AlumniList';
import MyActivity from '../pages/common/activity/MyActivity';
import MyEvents from '../pages/common/activity/MyEvents';
import MyOpportunities from '../pages/common/activity/MyOpportunities';
import MyNews from '../pages/common/activity/MyNews';
import Messages from '../pages/common/Messages';
import Settings from '../pages/settings/Settings';
import Profile from '../pages/Profile';
import NotificationsPage from '../pages/admin/Notifications';
import CoordinatorManagement from '../pages/CoordinatorManagement';
import ResetPassword from '../pages/ResetPassword';
import CoordinatorDashboard from '../pages/CoordinatorDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Admin Login Route - Show on home path */}
      <Route path="/" element={<Login />} />
      <Route path="/admin/login" element={<Navigate to="/" replace />} />
      
      {/* Admin Dashboard - redirect to login if not authenticated */}
      <Route path="/admin" element={<Navigate to="/" replace />} />
      
      {/* Coordinator Routes */}
      <Route path="/coordinator" element={<Navigate to="/coordinator/dashboard" replace />} />
      <Route path="/coordinator/login" element={<Navigate to="/" replace />} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Profile Route */}
      <Route path="/admin/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Notifications Route */}
      <Route path="/admin/notifications" element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />

      {/* Activity Routes */}
      <Route path="/admin/activity" element={
        <ProtectedRoute>
          <MyActivity />
        </ProtectedRoute>
      } />
      <Route path="/admin/activity/events" element={
        <ProtectedRoute>
          <MyEvents />
        </ProtectedRoute>
      } />
      <Route path="/admin/activity/opportunities" element={
        <ProtectedRoute>
          <MyOpportunities />
        </ProtectedRoute>
      } />
      <Route path="/admin/activity/news" element={
        <ProtectedRoute>
          <MyNews />
        </ProtectedRoute>
      } />
      
      {/* Coordinator Activity Routes */}
      <Route path="/coordinator/activity" element={
        <ProtectedRoute>
          <MyActivity />
        </ProtectedRoute>
      } />
      <Route path="/coordinator/activity/events" element={
        <ProtectedRoute>
          <MyEvents />
        </ProtectedRoute>
      } />
      <Route path="/coordinator/activity/opportunities" element={
        <ProtectedRoute>
          <MyOpportunities />
        </ProtectedRoute>
      } />
      <Route path="/coordinator/activity/news" element={
        <ProtectedRoute>
          <MyNews />
        </ProtectedRoute>
      } />
      
      {/* Events Management Routes */}
      <Route path="/admin/manage/events" element={
        <ProtectedRoute>
          <Events />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/manage/events/add" element={
        <ProtectedRoute>
          <AddEvent />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/manage/events/edit/:id" element={
        <ProtectedRoute>
          <EditEvent />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/events/:id/registrations" element={
        <ProtectedRoute>
          <EventRegistrations />
        </ProtectedRoute>
      } />
      
      {/* Test Route */}
      <Route path="/admin/test" element={
        <ProtectedRoute>
          <div style={{padding: '20px'}}>
            <h1>Test Route Working!</h1>
            <p>If you can see this, routing is working correctly.</p>
          </div>
        </ProtectedRoute>
      } />
      
      {/* Coordinator Events Management Routes */}
      <Route path="/coordinator/manage/events" element={
        <ProtectedRoute>
          <Events />
        </ProtectedRoute>
      } />
      
      <Route path="/coordinator/manage/events/add" element={
        <ProtectedRoute>
          <AddEvent />
        </ProtectedRoute>
      } />
      
      <Route path="/coordinator/manage/events/edit/:id" element={
        <ProtectedRoute>
          <EditEvent />
        </ProtectedRoute>
      } />
      
      <Route path="/coordinator/events/:id/registrations" element={
        <ProtectedRoute>
          <EventRegistrations />
        </ProtectedRoute>
      } />
      
      {/* Opportunities Management Routes */}
      <Route path="/admin/manage/opportunities" element={
        <ProtectedRoute>
          <Opportunities />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/manage/opportunities/add" element={
        <ProtectedRoute>
          <AddOpportunity />
        </ProtectedRoute>
      } />
      
            
      {/* Coordinator Opportunities Management Routes */}
      <Route path="/coordinator/manage/opportunities" element={
        <ProtectedRoute>
          <Opportunities />
        </ProtectedRoute>
      } />
      
      <Route path="/coordinator/manage/opportunities/add" element={
        <ProtectedRoute>
          <AddOpportunity />
        </ProtectedRoute>
      } />
      
            
      {/* News Management Routes */}
      <Route path="/admin/manage/news" element={
        <ProtectedRoute>
          <News />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/manage/news/add" element={
        <ProtectedRoute>
          <AddNews />
        </ProtectedRoute>
      } />
      
      {/* Coordinator News Management Routes */}
      <Route path="/coordinator/manage/news" element={
        <ProtectedRoute>
          <News />
        </ProtectedRoute>
      } />
      
      <Route path="/coordinator/manage/news/add" element={
        <ProtectedRoute>
          <AddNews />
        </ProtectedRoute>
      } />
      
      {/* Approval Routes */}
      <Route path="/admin/approvals/profile" element={
        <ProtectedRoute>
          <ProfileApproval />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/approvals/content" element={
        <ProtectedRoute>
          <ContentApproval />
        </ProtectedRoute>
      } />
      
      {/* Coordinator Approval Routes */}
      <Route path="/coordinator/approvals/profile" element={
        <ProtectedRoute>
          <ProfileApproval />
        </ProtectedRoute>
      } />
      
      <Route path="/coordinator/approvals/content" element={
        <ProtectedRoute>
          <ContentApproval />
        </ProtectedRoute>
      } />
      
      {/* User Management Routes */}
      <Route path="/admin/users/alumni" element={
        <ProtectedRoute>
          <AlumniList />
        </ProtectedRoute>
      } />
      
      {/* Coordinator User Management Routes */}
      <Route path="/coordinator/users/alumni" element={
        <ProtectedRoute>
          <AlumniList />
        </ProtectedRoute>
      } />
      
      {/* Coordinator Management Routes */}
      <Route path="/admin/coordinator" element={
        <ProtectedRoute>
          <CoordinatorManagement />
        </ProtectedRoute>
      } />
      
      {/* Coordinator Management Routes */}
      <Route path="/coordinator/coordinator" element={
        <ProtectedRoute>
          <CoordinatorManagement />
        </ProtectedRoute>
      } />
      
      {/* Coordinator Routes */}
      <Route path="/admin/reset-password" element={<ResetPassword />} />
      <Route path="/coordinator/reset-password" element={<ResetPassword />} />
      
      <Route path="/admin/coordinator-dashboard" element={
        <ProtectedRoute>
          <CoordinatorDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/coordinator/dashboard" element={
        <ProtectedRoute>
          <CoordinatorDashboard />
        </ProtectedRoute>
      } />
      
      {/* Communication Routes */}
      <Route path="/admin/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
      
      {/* Coordinator Communication Routes */}
      <Route path="/coordinator/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
      
      {/* Settings Routes */}
      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      {/* Coordinator Settings Routes */}
      <Route path="/coordinator/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
