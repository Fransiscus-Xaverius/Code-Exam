import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { useSelector } from 'react-redux';

import Dashboard from './pages/Dashboard';
import SolvePage from './pages/SolvePage';
import ProblemFormPage from './pages/ProblemFormPage';
import NotFoundPage from './pages/NotFoundPage';
import CompetitionListPage from './pages/competition/CompetitionListPage';
import CompetitionDetailsPage from './pages/competition/CompetitionDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompetitionFormPage from './pages/competition/CompetitionFormPage';
import SubmissionsForumPage from './pages/SubmissionForumPage';
import FrontendSolvePage from './pages/FrontEndSolvePage';
import CompetitionWorkspacePage from './pages/competition/CompetitionWorkspacePage';
import MySubmissionsPage from './pages/MySubmissionsPage';
import SubmissionDetailsPage from './pages/SubmissionDetailPage';

// Responsive wrapper component
const ResponsiveWrapper = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {children}
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userRole, loading } = useSelector(state => state.auth);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  return isAuthenticated && userRole === 'admin' ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    // <ResponsiveWrapper>
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />

      <Route path="/404" element={
        <PublicRoute>
          <NotFoundPage />
        </PublicRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path='/solve/:id' element={
        <ProtectedRoute>
          <SolvePage />
        </ProtectedRoute>
      } />

      <Route path='/solve-fe/:id' element={
        <ProtectedRoute>
          <FrontendSolvePage />
        </ProtectedRoute>
      } />

      <Route path='/problem/new' element={
        <AdminRoute>
          <ProblemFormPage />
        </AdminRoute>
      } />

      <Route path='/problem/edit/:id' element={
        <AdminRoute>
          <ProblemFormPage />
        </AdminRoute>
      } />

      <Route path="/competitions" element={
        <ProtectedRoute>
          <CompetitionListPage />
        </ProtectedRoute>
      } />

      <Route path="/competitions/:id" element={
        <ProtectedRoute>
          <CompetitionDetailsPage />
        </ProtectedRoute>
      } />

      <Route path="/competitions/:id/workspace" element={
        <ProtectedRoute>
          <CompetitionWorkspacePage />
        </ProtectedRoute>} />

      <Route path="/competition/new" element={
        <AdminRoute>
          <CompetitionFormPage />
        </AdminRoute>
      } />

      <Route path="/competition/edit/:id" element={
        <AdminRoute>
          <CompetitionFormPage />
        </AdminRoute>
      } />

      <Route path="/discussions" element={
        <ProtectedRoute>
          <SubmissionsForumPage />
        </ProtectedRoute>
      } />

      <Route path="/competitions/:competitionId/problems/:problemId/solve" element={
        <ProtectedRoute>
          <SolvePage />
        </ProtectedRoute>
      } />

      <Route path="/my-submissions" element={
        <ProtectedRoute>
          <MySubmissionsPage />
        </ProtectedRoute>
      } />

      <Route path="/submissions/:id" element={
        <ProtectedRoute>
          <SubmissionDetailsPage />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
    // </ResponsiveWrapper>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;