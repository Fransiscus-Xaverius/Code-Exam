import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Check, X, Clock, AlertTriangle, Code, Database } from 'lucide-react';

const SubmissionsList = ({ submissions = [], competitionId, isLoading, error }) => {
  const navigate = useNavigate();

  // Navigate to review a specific submission
  const handleReviewSubmission = (submissionId) => {
    navigate(`/solve/${submissionId}?mode=review&competition=${competitionId}`);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'wrong_answer':
        return 'bg-red-100 text-red-800';
      case 'compilation_error':
        return 'bg-orange-100 text-orange-800';
      case 'runtime_error':
        return 'bg-red-100 text-red-800';
      case 'time_limit_exceeded':
        return 'bg-purple-100 text-purple-800';
      case 'memory_limit_exceeded':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <Check size={16} className="text-green-600" />;
      case 'pending':
      case 'processing':
        return <Clock size={16} className="text-yellow-600" />;
      case 'wrong_answer':
        return <X size={16} className="text-red-600" />;
      case 'compilation_error':
        return <Code size={16} className="text-orange-600" />;
      case 'runtime_error':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'time_limit_exceeded':
        return <Clock size={16} className="text-purple-600" />;
      case 'memory_limit_exceeded':
        return <Database size={16} className="text-indigo-600" />;
      default:
        return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  // Format language display
  const formatLanguage = (languageCode) => {
    const languageMap = {
      '54': 'C++',
      '63': 'JavaScript',
      '71': 'Python',
      '62': 'Java'
    };
    return languageMap[languageCode] || languageCode;
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format status display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle size={32} className="mx-auto mb-4 text-yellow-500" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // Render empty state
  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-6 text-center">
        <FileText size={32} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">No submissions found</p>
      </div>
    );
  }

  // Responsive layout with card view for mobile and table for larger screens
  return (
    <div>
      {/* Mobile view - card based layout */}
      <div className="md:hidden space-y-4">
        {submissions.map((submission) => (
          <div 
            key={submission.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            onClick={() => handleReviewSubmission(submission.id)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{submission.problem?.title || 'Unknown Problem'}</h3>
                  <p className="text-sm text-gray-500">by {submission.user?.username || 'Unknown User'}</p>
                </div>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(submission.status)}`}>
                  {getStatusIcon(submission.status)}
                  <span className="ml-1">{formatStatus(submission.status)}</span>
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                <div>
                  <span className="text-gray-500">Language:</span> {formatLanguage(submission.language)}
                </div>
                <div>
                  <span className="text-gray-500">Score:</span> {submission.score !== null ? `${submission.score}/${submission}` : 'N/A'}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Submitted:</span> {formatDate(submission.submitted_at)}
                </div>
              </div>
              
              <button 
                className="mt-3 w-full text-center text-blue-600 border border-blue-200 rounded-md py-2 hover:bg-blue-50 transition-colors flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReviewSubmission(submission.id);
                }}
              >
                Review Submission
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view - table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Problem
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Language
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted At
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr 
                key={submission.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleReviewSubmission(submission.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {submission.problem?.title || 'Unknown Problem'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {submission.problem?.difficulty}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {submission.user?.username || 'Unknown User'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatLanguage(submission.language)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(submission.status)}`}>
                    {getStatusIcon(submission.status)}
                    <span className="ml-1">{formatStatus(submission.status)}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.score !== null ? `${submission.score}/${submission.problem.points}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(submission.submitted_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReviewSubmission(submission.id);
                    }}
                  >
                    Review
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionsList;