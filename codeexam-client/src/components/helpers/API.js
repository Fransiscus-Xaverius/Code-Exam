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

export default API;