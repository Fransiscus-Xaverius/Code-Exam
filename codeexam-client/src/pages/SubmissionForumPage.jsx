import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, MessageSquare, 
  ChevronUp, ChevronDown, 
  CheckCircle, XCircle, 
  Search
} from 'lucide-react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import API from '../components/helpers/API';

const SubmissionsForumPage = () => {
  // State Management
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState({});
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  
  // Get user role from Redux store instead of local state
  const { userRole } = useSelector(state => state.auth);
  
  // Filtering and Sorting States
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('popular');

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch Submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        setIsDataReady(false);
        
        const token = localStorage.getItem('codeexam_token');
        
        const response = await API.get('/api/submissions/public', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
          params: { filter, sort, search: searchQuery, tab: activeTab }
        });
        
        // Ensure isLiked is properly set for each submission
        const submissionsWithLikeStatus = (response.data.submissions || []).map(submission => ({
          ...submission,
          isLiked: Boolean(submission.isLiked),
          likes: submission.likes || 0
        }));
        
        setSubmissions(submissionsWithLikeStatus);
        setError(null);
        setIsDataReady(true);
        
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions. Please try again later.');
        setSubmissions([]);
        setIsDataReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [filter, sort, searchQuery, activeTab]);

  // This useEffect runs after submissions are fetched and ready
  useEffect(() => {
    if (isDataReady && submissions.length > 0) {
      console.log('Submissions are ready for rendering:', submissions);
      console.log('First submission:', submissions[0]);
      console.log('First submission discussions:', submissions[0]?.submission_discussions);
    }
  }, [submissions, isDataReady]);

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
      const response = await API.get(`/api/comments/discussion/${submissionId}`);
      setComments(prev => ({ 
        ...prev, 
        [submissionId]: response.data.comments || [] 
      }));
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments(prev => ({ ...prev, [submissionId]: [] }));
    }
  };

  const addComment = async (submissionId, commentText) => {
    if (!commentText.trim()) return;
    
    try {
      const response = await API.post(`/api/comments/discussion/${submissionId}`, {
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

  const likeSubmission = async (submissionId) => {
    try {
      const token = localStorage.getItem('codeexam_token');
      
      const response = await API.post(`/api/comments/discussion/${submissionId}/like`, {}, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { 
                ...sub, 
                likes: response.data.likeCount,
                isLiked: response.data.isLiked 
              } 
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
    const languageMap = {
      45: 'Assembly',
      46: 'Bash',
      47: 'Basic',
      104: 'C',
      110: 'C',
      75: 'C',
      76: 'C++',
      103: 'C',
      105: 'C++',
      48: 'C',
      52: 'C++',
      49: 'C',
      53: 'C++',
      50: 'C',
      54: 'C++',
      86: 'Clojure',
      51: 'C#',
      77: 'COBOL',
      55: 'Common Lisp',
      90: 'Dart',
      56: 'D',
      57: 'Elixir',
      58: 'Erlang',
      44: 'Executable',
      87: 'F#',
      59: 'Fortran',
      60: 'Go',
      95: 'Go',
      106: 'Go',
      107: 'Go',
      88: 'Groovy',
      61: 'Haskell',
      96: 'JavaFX',
      91: 'Java',
      62: 'Java',
      63: 'JavaScript',
      93: 'JavaScript',
      97: 'JavaScript',
      102: 'JavaScript',
      78: 'Kotlin',
      111: 'Kotlin',
      64: 'Lua',
      89: 'Multi-file',
      79: 'Objective-C',
      65: 'OCaml',
      66: 'Octave',
      67: 'Pascal',
      85: 'Perl',
      68: 'PHP',
      98: 'PHP',
      43: 'Plain Text',
      69: 'Prolog',
      70: 'Python',
      92: 'Python',
      100: 'Python',
      109: 'Python',
      71: 'Python',
      80: 'R',
      99: 'R',
      72: 'Ruby',
      73: 'Rust',
      108: 'Rust',
      81: 'Scala',
      82: 'SQL',
      83: 'Swift',
      74: 'TypeScript',
      94: 'TypeScript',
      101: 'TypeScript',
      84: 'Visual Basic.Net'
    };
  
    const languageName = typeof language === 'number' ? languageMap[language] || 'Unknown' : language;
  
    const getColorClass = (lang) => {
      if (!lang) return 'bg-gray-500 text-white';
      
      const lowerLang = lang.toLowerCase();
      
      if (lowerLang.includes('javascript')) return 'bg-yellow-400 text-black';
      if (lowerLang.includes('python')) return 'bg-blue-500 text-white';
      if (lowerLang.includes('java') && !lowerLang.includes('script')) return 'bg-orange-500 text-white';
      if (lowerLang.includes('c++')) return 'bg-purple-500 text-white';
      if (lowerLang === 'c') return 'bg-blue-600 text-white';
      if (lowerLang.includes('c#')) return 'bg-green-600 text-white';
      if (lowerLang.includes('typescript')) return 'bg-blue-400 text-white';
      if (lowerLang.includes('go')) return 'bg-cyan-500 text-white';
      if (lowerLang.includes('rust')) return 'bg-orange-600 text-white';
      if (lowerLang.includes('php')) return 'bg-indigo-500 text-white';
      if (lowerLang.includes('ruby')) return 'bg-red-500 text-white';
      if (lowerLang.includes('swift')) return 'bg-orange-400 text-white';
      if (lowerLang.includes('kotlin')) return 'bg-purple-400 text-white';
      if (lowerLang.includes('dart')) return 'bg-teal-500 text-white';
      if (lowerLang.includes('scala')) return 'bg-red-600 text-white';
      
      return 'bg-gray-500 text-white';
    };
  
    const colorClass = getColorClass(languageName);
  
    return (
      <span className={`${colorClass} text-xs px-2 py-1 rounded-full`}>
        {languageName}
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

  // Submissions Rendering
  const renderSubmissions = () => {
    if (isLoading) {
      return <div className="text-center py-10">Loading submissions...</div>;
    }
    
    if (error) {
      return <div className="text-center py-10 text-red-500">{error}</div>;
    }
    
    if (!isDataReady) {
      return <div className="text-center py-10">Preparing submissions...</div>;
    }
    
    if (submissions.length === 0) {
      return <div className="text-center py-10">No submissions found.</div>;
    }

    console.log('Rendering submissions now:', submissions.length);
    
    return (
      <div className="space-y-4">
        {submissions.map(submission => (
          <div key={submission.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Submission Header */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className='text-lg font-medium text-blue-700'>
                    {submission.submission_discussions?.title || 'No Title Available'}
                  </h2>
                  <h3 className="text-lg font-medium text-blue-600">
                    Problem: {submission.problem?.title || 'Unknown Problem'}
                  </h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-sm text-gray-600">
                      by {submission.user?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(submission.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <LanguageBadge language={parseInt(submission.language)} />
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
                  className={`flex items-center cursor-pointer ${submission.isLiked ? 'text-blue-600' : 'text-gray-600'}`}
                  onClick={() => likeSubmission(submission.id)}
                >
                  <ThumbsUp className={`h-4 w-4 mr-1 ${submission.isLiked ? 'fill-current' : ''}`} />
                  <span>{submission.likes || 0}</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => toggleComments(submission.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{submission.commentCount || 0}</span>
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
                
                {submission.submission_discussions?.content && (
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
                          <span>{comment.likes || 0}</span>
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
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="ml-0 md:ml-64 flex-1 p-6">
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
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('popular')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'popular'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Popular (Last 30 Days)
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Trending
            </button>
          </nav>
        </div>
        
        {/* Submissions List */}
        {renderSubmissions()}
      </div>
    </div>
  );
};

export default SubmissionsForumPage;