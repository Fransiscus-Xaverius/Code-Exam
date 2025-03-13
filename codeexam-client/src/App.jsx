import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { useSelector } from 'react-redux';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import SolvePage from './pages/SolvePage';
import ProblemFormPage from './pages/ProblemFormPage';
import NotFoundPage from './pages/NotFoundPage';
import CompetitionListPage from './pages/competition/CompetitionListPage';
import CompetitionDetailsPage from './pages/competition/CompetitionDetailsPage';
import CompetitionFormPage from './pages/competition/CompetitionFormPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userRole, loading } = useSelector(state => state.auth);
  
  if (loading) return <div>Loading...</div>;
  return isAuthenticated && userRole === 'admin' ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
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
      
      <Route path='/problem/new' element={
        <AdminRoute>
          <ProblemFormPage />
        </AdminRoute>
      }/>
      
      <Route path='/problem/edit/:id' element={
        <AdminRoute>
          <ProblemFormPage />
        </AdminRoute>
      }/>
      
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

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
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