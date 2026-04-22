import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout Components
import AdminLayout from '../layouts/AdminLayout';
import CoordinatorLayout from '../layouts/CoordinatorLayout';

// Auth Pages
import Login from '../pages/Login';
import ResetPassword from '../pages/ResetPassword';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import CoordinatorManagement from '../pages/admin/CoordinatorManagement';
import ContentApproval from '../pages/admin/ContentApproval';

// Coordinator Pages
import CoordinatorDashboard from '../pages/coordinator/CoordinatorDashboard';
import ProfileApproval from '../pages/coordinator/ProfileApproval';

// Common Pages (shared by both roles)
import Profile from '../pages/common/Profile';
import Settings from '../pages/common/Settings';
import AlumniList from '../pages/common/AlumniList';
import EventsManagement from '../pages/common/events/Events';
import OpportunitiesManagement from '../pages/common/opportunities/Opportunities';
import NewsManagement from '../pages/common/news/News';
import Messages from '../pages/common/Messages';
import Notifications from '../pages/common/Notifications';


// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  console.log('🔍 ProtectedRoute check:', {
    isAuthenticated,
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    requiredRole,
    path: window.location.pathname
  });

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.log('❌ Role mismatch, redirecting to login. Required:', requiredRole, 'User role:', user?.role);
    return <Navigate to="/" replace />;
  }

  console.log('✅ Authentication passed, rendering protected content');
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />
      <Route path="/coordinator/reset-password" element={<ResetPassword />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="coordinator" element={<CoordinatorManagement />} />
              <Route path="content-approval" element={<ContentApproval />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users/alumni" element={<AlumniList />} />
              <Route path="manage/events" element={<EventsManagement />} />
              <Route path="manage/opportunities" element={<OpportunitiesManagement />} />
              <Route path="manage/news" element={<NewsManagement />} />
                            <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Coordinator Routes */}
      <Route path="/coordinator/*" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <Routes>
              <Route path="dashboard" element={<CoordinatorDashboard />} />
              <Route path="profile-approval" element={<ProfileApproval />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users/alumni" element={<AlumniList />} />
              <Route path="manage/events" element={<EventsManagement />} />
              <Route path="manage/opportunities" element={<OpportunitiesManagement />} />
              <Route path="manage/news" element={<NewsManagement />} />
                            <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="" element={<Navigate to="/coordinator/dashboard" replace />} />
            </Routes>
          </CoordinatorLayout>
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
