import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../Card';
import API from '../helpers/API';

const RecentActivity = ({ userId, token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        
        // Get recent submissions
        const submissionsResponse = await API.get('/api/submissions', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
          params: {
            limit: 5,
            page: 1
          }
        });
        
        if (submissionsResponse.data.success) {
          setRecentSubmissions(submissionsResponse.data.submissions || []);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setError('Failed to load recent activity. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId && token) {
      fetchRecentActivity();
    }
  }, [userId, token]);
  
  // Format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };
  
  // Get status icon based on submission status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'wrong_answer':
      case 'compilation_error':
      case 'runtime_error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Navigate to submission details
  const handleViewSubmission = (submissionId) => {
    navigate(`/solve/${submissionId}?mode=review`);
  };
  
  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <h2 className="text-lg font-semibold mb-4 bg-gray-200 h-6 w-36 rounded"></h2>
        <div className="space-y-4">
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <Activity className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>
      
      {recentSubmissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity found.</p>
          <p className="text-sm mt-2">Start solving problems to see your activity here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentSubmissions.map((submission) => (
            <div 
              key={submission.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleViewSubmission(submission.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mt-1 mr-3">
                    {getStatusIcon(submission.status)}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {submission.problem?.title || 'Unknown Problem'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {submission.language === '63' ? 'JavaScript' : 
                       submission.language === '71' ? 'Python' :
                       submission.language === '62' ? 'Java' :
                       submission.language === '54' ? 'C++' : 'Unknown Language'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatRelativeTime(submission.submitted_at)}
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className={`px-2 py-1 rounded-full ${
                  submission.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  submission.status === 'pending' || submission.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {submission.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentActivity;