import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import API from '../components/helpers/API'

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('codeexam_token');
        if (token) {
          // Set default authorization header
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is valid and user status is active
          const response = await API.get('/api/auth/me');
          
          // Check if user account is active
          if (response.data.user && response.data.user.status !== 'active') {
            // Account is banned or inactive, handle logout
            localStorage.removeItem('codeexam_token');
            delete API.defaults.headers.common['Authorization'];
            
            // Store status for login page display
            const accountStatus = response.data.user.status;
            const message = accountStatus === 'banned' 
              ? 'Your account has been banned. Please contact administrator for assistance.'
              : 'Your account has been deactivated. Please contact administrator for assistance.';
            
            sessionStorage.setItem('accountStatusMessage', message);
            sessionStorage.setItem('accountStatus', accountStatus);
            
            setUser(null);
            navigate('/login');
          } else {
            setUser(response.data.user);
          }
        }
      } catch (error) {
        // Token invalid or expired, or 403 error handled by API interceptor
        localStorage.removeItem('codeexam_token');
        delete API.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const login = async (email, password) => {
    const response = await API.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Save token and set axios default header
    localStorage.setItem('codeexam_token', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(user);
    navigate('/dashboard');
    return user;
  };
  
  const logout = () => {
    localStorage.removeItem('codeexam_token');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };
  
  const register = async (userData) => {
    const response = await API.post('/api/auth/register', userData);
    const { token, user } = response.data;
    
    localStorage.setItem('codeexam_token', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(user);
    navigate('/dashboard');
    return user;
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};