import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Gallery from '../pages/common/Gallery';
import Messages from '../pages/common/Messages';
import Notifications from '../pages/common/Notifications';


// Catch All Route Component
const CatchAllRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  console.log('🔍 CatchAllRoute check:', {
    isAuthenticated,
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    loading,
    path: location.pathname
  });

  // If still loading, show loader
  if (loading) {
    console.log('⏳ CatchAllRoute: Authentication loading, showing loader');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authenticated and on a valid route, don't redirect
  if (isAuthenticated && user) {
    // Check if current path is a valid admin or coordinator route
    const isValidAdminRoute = location.pathname.startsWith('/admin/');
    const isValidCoordinatorRoute = location.pathname.startsWith('/coordinator/');
    
    if ((user.role === 'admin' && isValidAdminRoute) || 
        (user.role === 'coordinator' && isValidCoordinatorRoute)) {
      console.log('✅ CatchAllRoute: Valid authenticated route, staying on current page');
      return <Navigate to={location.pathname} replace />;
    }
  }

  // If not authenticated or invalid route, redirect to login
  console.log('❌ CatchAllRoute: Not authenticated or invalid route, redirecting to login');
  return <Navigate to="/" replace />;
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  console.log('🔍 ProtectedRoute check:', {
    isAuthenticated,
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    requiredRole,
    path: window.location.pathname,
    loading
  });

  if (loading) {
    console.log('⏳ Authentication loading, showing loader');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/coordinator" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <CoordinatorManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/content-approval" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <ContentApproval />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/profile" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <Profile />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <Settings />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users/alumni" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AlumniList />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/manage/events" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <EventsManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/manage/opportunities" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <OpportunitiesManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/manage/news" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <NewsManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/gallery" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <Gallery />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/messages" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <Messages />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <Notifications />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Coordinator Routes */}
      <Route path="/coordinator" element={<Navigate to="/coordinator/dashboard" replace />} />
      <Route path="/coordinator/dashboard" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <CoordinatorDashboard />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/profile-approval" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <ProfileApproval />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/profile" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <Profile />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/settings" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <Settings />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/users/alumni" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <AlumniList />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/manage/events" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <EventsManagement />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/manage/opportunities" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <OpportunitiesManagement />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/manage/news" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <NewsManagement />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/gallery" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <Gallery />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/messages" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <Messages />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/notifications" element={
        <ProtectedRoute requiredRole="coordinator">
          <CoordinatorLayout>
            <Notifications />
          </CoordinatorLayout>
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<CatchAllRoute />} />
    </Routes>
  );
};

export default AppRoutes;
