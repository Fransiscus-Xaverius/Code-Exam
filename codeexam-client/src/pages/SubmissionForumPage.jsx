import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Code, Trophy, Users, 
  Filter, Search, ThumbsUp, MessageSquare, 
  ChevronUp, ChevronDown, BookOpen, 
  LogOut, CheckCircle, XCircle 
} from 'lucide-react';
import axios from 'axios';
import API from '../components/helpers/API'

const SubmissionsForumPage = () => {
  // State Management
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState({});
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [userRole, setUserRole] = useState('competitor');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and Sorting States
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('popular');

  // Fetch Submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('codeexam_token');
        
        const response = await API.get('/api/submissions/public', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
          params: { filter, sort, search: searchQuery, tab: activeTab }
        });
        
        setSubmissions(response.data.submissions || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions. Please try again later.');
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [filter, sort, searchQuery, activeTab]);

  // Toggle Submission Expansion
  const toggleSubmission = (submissionId) => {
    setExpandedSubmission(
      expandedSubmission === submissionId ? null : submissionId
    );
    if (!comments[submissionId]) {
      fetchComments(submissionId);
    }
  };

  // Toggle Comments Visibility
  const toggleComments = (submissionId) => {
    setExpandedComments(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId]
    }));
    if (!comments[submissionId]) {
      fetchComments(submissionId);
    }
  };

  // Fetch Comments
  const fetchComments = async (submissionId) => {
    try {
      const response = await API.get(`/api/discussions/${submissionId}/comments`);
      setComments(prev => ({ 
        ...prev, 
        [submissionId]: response.data.comments || [] 
      }));
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments(prev => ({ ...prev, [submissionId]: [] }));
    }
  };

  // Add Comment
  const addComment = async (submissionId, commentText) => {
    if (!commentText.trim()) return;
    
    try {
      const response = await API.post(`/api/discussions/${submissionId}/comments`, {
        content: commentText
      });
      
      const newComment = response.data.comment;
      
      setComments(prev => ({
        ...prev,
        [submissionId]: [...(prev[submissionId] || []), newComment]
      }));

      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, commentCount: sub.commentCount + 1 } 
            : sub
        )
      );
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Like Submission
  const likeSubmission = async (submissionId) => {
    try {
      await API.post(`/api/discussions/${submissionId}/like`);
      
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, likes: sub.likes + 1 } 
            : sub
        )
      );
    } catch (err) {
      console.error('Error liking submission:', err);
    }
  };

  // Utility Functions
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Component Rendering Helpers
  const StatusBadge = ({ status }) => {
    const colorClass = 
      status === 'accepted' ? 'bg-green-500' : 
      status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500';
    
    const icon = status === 'accepted' ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />;
    
    return (
      <span className={`${colorClass} text-white text-xs px-2 py-1 rounded-full flex items-center`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const LanguageBadge = ({ language }) => {
    const colorClass = 
      language === 'JavaScript' ? 'bg-yellow-400 text-black' : 
      language === 'Python' ? 'bg-blue-500 text-white' : 
      language === 'Java' ? 'bg-orange-500 text-white' : 
      language === 'C++' ? 'bg-purple-500 text-white' : 'bg-gray-500 text-white';
    
    return (
      <span className={`${colorClass} text-xs px-2 py-1 rounded-full`}>
        {language}
      </span>
    );
  };

  const CommentForm = ({ submissionId }) => {
    const [commentText, setCommentText] = useState('');
    
    const handleSubmit = (e) => {
      e.preventDefault();
      addComment(submissionId, commentText);
      setCommentText('');
    };
    
    return (
      <form onSubmit={handleSubmit} className="mt-2">
        <div className="flex">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-grow p-2 border border-gray-300 rounded-l"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            disabled={!commentText.trim()}
          >
            Post
          </button>
        </div>
      </form>
    );
  };

  // Sidebar Rendering
  const renderSidebar = () => {
    const commonItems = [
      { icon: <Code className="h-5 w-5" />, label: 'Problems' },
      { icon: <MessageSquare className="h-5 w-5" />, label: 'Discussions' },
      { icon: <Trophy className="h-5 w-5" />, label: 'Leaderboard' },
    ];
    
    const roleSpecificItems = {
      competitor: [
        { icon: <UserCircle className="h-5 w-5" />, label: 'My Profile' },
        { icon: <BookOpen className="h-5 w-5" />, label: 'Learning Resources' },
      ],
      admin: [
        { icon: <Users className="h-5 w-5" />, label: 'Manage Users' },
        { icon: <Filter className="h-5 w-5" />, label: 'All Submissions' },
      ]
    };
    
    const items = [...commonItems, ...roleSpecificItems[userRole]];
    
    return (
      <div className="bg-gray-800 text-white w-64 h-screen fixed left-0 top-0">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">CodeExam</h1>
          <div className="text-sm text-gray-400 mt-1">
            Logged in as <span className="font-medium text-gray-200 capitalize">{userRole}</span>
          </div>
        </div>
        <nav className="mt-4">
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-700">
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button 
            onClick={() => setUserRole(userRole === 'competitor' ? 'admin' : 'competitor')} 
            className="w-full bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm"
          >
            Switch Role (Demo)
          </button>
          <button 
            className="w-full mt-2 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm flex items-center justify-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    );
  };

  // Submissions Rendering
  const renderSubmissions = () => {
    if (isLoading) {
      return <div className="text-center py-10">Loading submissions...</div>;
    }
    
    if (error) {
      return <div className="text-center py-10 text-red-500">{error}</div>;
    }
    
    if (submissions.length === 0) {
      return <div className="text-center py-10">No submissions found.</div>;
    }
    
    return (
      <div className="space-y-4">
        {submissions.map(submission => (
          <div key={submission.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Submission Header */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className='text-lg font-medium text-blue-700'>
                    {submission.submission_discussions.title}
                  </h2>
                  <h3 className="text-lg font-medium text-blue-600">
                    Problem: {submission.problem.title}
                  </h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-sm text-gray-600">
                      by {submission.user.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(submission.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <LanguageBadge language={submission.language} />
                  <StatusBadge status={submission.status} />
                </div>
              </div>
              
              {/* Metrics Row */}
              <div className="flex mt-3 text-sm text-gray-600 space-x-4">
                {submission.status === 'accepted' && (
                  <>
                    <div>Runtime: {submission.runtime}</div>
                    <div>Memory: {submission.memory}</div>
                  </>
                )}
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => likeSubmission(submission.id)}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{submission.likes}</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => toggleComments(submission.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{submission.commentCount}</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer ml-auto" 
                  onClick={() => toggleSubmission(submission.id)}
                >
                  <span className="mr-1">View Code</span>
                  {expandedSubmission === submission.id ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </div>
            
            {/* Expanded Code Section */}
            {expandedSubmission === submission.id && (
              <div className="p-4 bg-gray-50">
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">Solution:</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                    <code>{submission.code}</code>
                  </pre>
                </div>
                
                {submission.submission_discussions.content && (
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2">Explanation:</h3>
                    <p className="text-gray-700">{submission.submission_discussions.content}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Comments Section */}
            {expandedComments[submission.id] && (
              <div className="p-4 bg-gray-100 border-t">
                <h3 className="text-md font-medium mb-2">Comments:</h3>
                {comments[submission.id]?.length ? (
                  <div className="space-y-3">
                    {comments[submission.id].map(comment => (
                      <div key={comment.id} className="bg-white p-3 rounded shadow-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-600">
                            {comment.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(comment.timestamp)}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700">{comment.content}</p>
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          <span>{comment.likes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No comments yet.</div>
                )}
                
                <CommentForm submissionId={submission.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Main Component Render
  return (
    <div className="flex min-h-screen bg-gray-100">
      {renderSidebar()}
      
      <div className="ml-64 flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Submission Discussions</h1>
          <p className="text-gray-600 mt-1">
            Browse, discuss, and learn from other programmers' solutions
          </p>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="all">All Statuses</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="newest">Newest</option>
              <option value="most-liked">Most Liked</option>
              <option value="most-discussed">Most Discussed</option>
            </select>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex space-x-4">
            {['popular', 'recent', 'my-submissions'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 border-b-2 ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent hover:text-blue-500'
                }`}
              >
                {tab.replace('-', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </button>
            ))}
          </div>
        </div>
        
        {/* Submissions List */}
        {renderSubmissions()}
      </div>
    </div>
  );
};

export default SubmissionsForumPage;