import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { Alert } from '../components/Alert';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { InputField } from '../components/InputField';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountStatusMessage, setAccountStatusMessage] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  // Check for account status messages from sessionStorage
  useEffect(() => {
    const statusMessage = sessionStorage.getItem('accountStatusMessage');
    const status = sessionStorage.getItem('accountStatus');

    if (statusMessage && status) {
      setAccountStatusMessage(statusMessage);
      setAccountStatus(status);

      // Clear the messages from sessionStorage
      sessionStorage.removeItem('accountStatusMessage');
      sessionStorage.removeItem('accountStatus');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      dispatch(loginStart());
      setLocalLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Handle account status errors specifically (403 status)
      if (response.status === 403 && data.accountStatus) {
        setAccountStatusMessage(data.message);
        setAccountStatus(data.accountStatus);
        setLocalLoading(false);
        // Reset Redux loading state properly
        dispatch(loginFailure(''));
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Clear account status messages only on successful login
      setAccountStatusMessage('');
      setAccountStatus('');

      localStorage.setItem('codeexam_token', data.token);

      dispatch(loginSuccess({
        user: data.user,
        token: data.token
      }));

      navigate('/dashboard');

    } catch (err) {
      setLocalLoading(false);
      dispatch(loginFailure(err.message || 'Login failed. Please try again.'));
    }
  };

  // Don't clear account status messages when typing - let them persist
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="flex flex-col items-center">
          <Logo className="h-12 w-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 text-center">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600 text-center max-w-sm">
            Sign in to your account to continue your coding journey
          </p>
        </div>

        {/* Account Status Messages */}
        {accountStatusMessage && (
          <Alert
            type={accountStatus === 'banned' ? 'error' : 'warning'}
            message={
              accountStatus === 'banned'
                ? "Your account has been banned. Please contact administrator for assistance."
                : accountStatus === 'inactive'
                  ? "Your account has been deactivated. Please contact administrator for assistance."
                  : accountStatusMessage
            }
            className="animate-fade-in"
          />
        )}

        {error && !accountStatusMessage && (
          <Alert
            type="error"
            message={error}
            className="animate-fade-in"
          />
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <InputField
              label="Email address"
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading || localLoading}
              error={error && error.includes('email') ? error : false}
              aria-label="Email address"
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading || localLoading}
              aria-label="Password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <a
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={loading || localLoading}
            className="py-2.5 text-base font-medium shadow-sm"
          >
            {(loading || localLoading) ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : 'Sign in'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Sign up
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;