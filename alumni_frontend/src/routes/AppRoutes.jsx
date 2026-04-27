import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthWrapper from '../context/AuthWrapper';
import PrivateRoute from './PrivateRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ResetPassword from '../pages/ResetPassword';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import MyApplications from '../pages/MyApplications';
import MyEvents from '../pages/MyEvents';
import MyPosts from '../pages/MyPosts';
import AlumniDirectory from '../pages/AlumniDirectory';
import Opportunities from '../pages/Opportunities';
import AddOpportunity from '../pages/AddOpportunity';
import EditOpportunity from '../pages/EditOpportunity';
import Events from '../pages/Events';
import AddEvent from '../pages/AddEvent';
import EditEvent from '../pages/EditEvent';
import News from '../pages/News';
import Gallery from '../pages/Gallery';
import Messages from '../pages/Messages';
import AlumniDetails from '../pages/AlumniDetails';
import OpportunityDetails from '../pages/OpportunityDetails';
import EventDetails from '../pages/EventDetails';
import NewsDetails from '../pages/NewsDetails';
import ProfilePage from '../pages/Profile';
import Settings from '../pages/Settings';
import NotificationsPage from '../pages/NotificationsPage';
import ApplicationRequests from '../pages/ApplicationRequests';
import EventRegistrations from '../pages/EventRegistrations';

// Catch All Route Component
const CatchAllRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('🔍 Alumni CatchAllRoute check:', {
    isAuthenticated,
    loading,
    path: location.pathname
  });

  // If still loading, show loader
  if (loading) {
    console.log('⏳ Alumni CatchAllRoute: Authentication loading, showing loader');
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

  // If authenticated and on a valid route, stay on current page
  if (isAuthenticated) {
    // Check if current path is a valid alumni route
    const isValidAlumniRoute = location.pathname.startsWith('/dashboard') || 
                              location.pathname.startsWith('/my-') ||
                              location.pathname === '/messages' ||
                              location.pathname === '/alumni-directory' ||
                              location.pathname === '/opportunities' ||
                              location.pathname === '/events' ||
                              location.pathname === '/news' ||
                              location.pathname === '/gallery' ||
                              location.pathname.startsWith('/opportunity/') ||
                              location.pathname.startsWith('/event/') ||
                              location.pathname.startsWith('/news/');
    
    if (isValidAlumniRoute) {
      console.log('✅ Alumni CatchAllRoute: Valid authenticated route, staying on current page');
      return <Navigate to={location.pathname} replace />;
    }
  }

  // If not authenticated or invalid route, redirect to login
  console.log('❌ Alumni CatchAllRoute: Not authenticated or invalid route, redirecting to login');
  return <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <AuthWrapper>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
        </Route>
        
        <Route path="/my-applications" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<MyApplications />} />
        </Route>
        
        <Route path="/my-events" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<MyEvents />} />
        </Route>
        
        <Route path="/my-posts" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<MyPosts />} />
        </Route>
        
        <Route path="/dashboard/alumni" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<AlumniDirectory />} />
          <Route path=":id" element={<AlumniDetails />} />
        </Route>
        
        <Route path="/dashboard/opportunities" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Opportunities />} />
          <Route path="add" element={<AddOpportunity />} />
          <Route path="edit/:id" element={<EditOpportunity />} />
          <Route path=":id" element={<OpportunityDetails />} />
          <Route path=":id/applications" element={<ApplicationRequests />} />
        </Route>
        
        <Route path="/dashboard/events" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Events />} />
          <Route path="add" element={<AddEvent />} />
          <Route path="edit/:id" element={<EditEvent />} />
          <Route path=":id" element={<EventDetails />} />
          <Route path=":id/registrations" element={<EventRegistrations />} />
        </Route>
        
        <Route path="/dashboard/news" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<News />} />
          <Route path=":id" element={<NewsDetails />} />
        </Route>
        
        <Route path="/dashboard/gallery" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Gallery />} />
        </Route>
        
        <Route path="/dashboard/messages" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Messages />} />
        </Route>
        
                
        <Route path="/dashboard/profile" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<ProfilePage />} />
        </Route>
        
        <Route path="/dashboard/settings" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Settings />} />
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<CatchAllRoute />} />
      </Routes>
    </AuthWrapper>
  );
};

export default AppRoutes;
