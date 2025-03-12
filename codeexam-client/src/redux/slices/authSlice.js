import { createSlice } from '@reduxjs/toolkit';
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY|| 'default_fallback_key';

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (data) => {
  try {
    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return null;
  }
};

// Load user data
const storedUser = localStorage.getItem('user');
const storedRole = localStorage.getItem('userRole');

const initialState = {
  userRole: storedRole ? decryptData(storedRole) : 'competitor',
  isAuthenticated: !!localStorage.getItem('codeexam_token'),
  user: storedUser ? decryptData(storedUser) : null,
  token: localStorage.getItem('codeexam_token') || null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload.user;
      state.userRole = action.payload.user.role;
      state.token = action.payload.token;
      
      // Encrypt and store user data
      localStorage.setItem('codeexam_token', action.payload.token);
      localStorage.setItem('user', encryptData(action.payload.user));
      localStorage.setItem('userRole', encryptData(action.payload.user.role));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.userRole = 'competitor';

      // Remove encrypted data
      localStorage.removeItem('codeexam_token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    },
    toggleUserRole: (state) => {
      if (state.userRole === 'competitor') state.userRole = 'admin';
      else if (state.userRole === 'admin') state.userRole = 'judge';
      else state.userRole = 'competitor';
      
      // Encrypt and persist role change
      localStorage.setItem('userRole', encryptData(state.userRole));
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, toggleUserRole } = authSlice.actions;
export default authSlice.reducer;
