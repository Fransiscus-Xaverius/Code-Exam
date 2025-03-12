import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo className="h-16 w-16 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">404 - Page Not Found</h1>
          <p className="text-gray-600 mt-2">The page you are looking for doesn't exist</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-gray-500 mb-6 text-center">
            <p>The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
          </div>
          
          <Button
            onClick={() => navigate('/dashboard')}
            fullWidth
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          
          <div className="mt-4">
            <p className="text-gray-600">
              Need help?{' '}
              <a href="/contact" className="text-blue-600 hover:text-blue-800">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;