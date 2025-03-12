import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { Alert } from '../components/Alert';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Dispatch login start action
      dispatch(loginStart());
      
      // Make API call to login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('codeexam_token', data.token);
      
      // Dispatch successful login with user data
      dispatch(loginSuccess({
        user: data.user,
        token: data.token
      }));
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      // Dispatch login failure with error message
      dispatch(loginFailure(err.message || 'Login failed. Please try again.'));
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo className="h-16 w-16 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Welcome to CodeExam</h1>
          <p className="text-gray-600 mt-2">Sign in to continue to your dashboard</p>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        <form onSubmit={handleSubmit}>
          <InputField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="youremail@example.com"
            className="mb-4"
          />
          
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Your password"
            className="mb-6"
          />
          
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="mb-4"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        
        <div className="flex flex-col items-center mt-6">
          <a href="/forgot-password" className="text-blue-600 hover:text-blue-800 mb-2">
            Forgot password?
          </a>
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-800">
              Sign up
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;