import { Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthWrapper>
  );
};

export default AppRoutes;
