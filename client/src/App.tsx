import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PublicDashboard from './pages/PublicDashboard';
import QuestionDetail from './pages/QuestionDetail';
import AskQuestion from './pages/AskQuestion';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminFlagged from './pages/AdminFlagged';
import AdminLayout from './components/AdminLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdminAuthenticated, loading } = useAdmin();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  return isAdminAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

// Admin Public Route Component (redirects to admin dashboard if already authenticated)
const AdminPublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdminAuthenticated, loading } = useAdmin();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  return isAdminAuthenticated ? <Navigate to="/admin/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
              {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
              
              {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/ask" element={
              <ProtectedRoute>
                <AskQuestion />
              </ProtectedRoute>
            } />
            <Route path="/question/:id" element={<QuestionDetail />} />
            <Route path="/" element={<PublicDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={
                <AdminPublicRoute>
                  <AdminLogin />
                </AdminPublicRoute>
              } />
              <Route path="/admin/dashboard" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/flagged" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminFlagged />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
          </Routes>
        </div>
      </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App; 