import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.API_BASE_URL,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codeexam_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle account status errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to account status (banned/inactive)
    // Skip login endpoint as it's handled separately
    if (error.response?.status === 403 && 
        error.response?.data?.accountStatus &&
        !error.config?.url?.includes('/auth/login')) {
      const { accountStatus, message } = error.response.data;
      
      // Store the status message for display on login page
      sessionStorage.setItem('accountStatusMessage', message);
      sessionStorage.setItem('accountStatus', accountStatus);
      
      // Clear authentication data
      localStorage.removeItem('codeexam_token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;