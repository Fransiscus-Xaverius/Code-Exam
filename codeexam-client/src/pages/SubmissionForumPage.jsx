import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Code, Trophy, Users, Clock, Database, 
  Filter, Search, ThumbsUp, MessageSquare, ChevronUp, 
  ChevronDown, BookOpen, LogOut, Tag, CheckCircle, XCircle 
} from 'lucide-react';
import axios from 'axios';

const SubmissionsForumPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState({});
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [userRole, setUserRole] = useState('competitor');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'accepted', 'rejected'
  const [sort, setSort] = useState('newest'); // 'newest', 'most-liked', 'most-discussed'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('popular'); // 'popular', 'recent', 'my-submissions'
  
  // Fetch submissions from API
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('codeexam_token');
        
        // Mock API endpoint would be different in production
        const response = await axios.get('/api/submissions', {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          },
          params: {
            filter,
            sort,
            search: searchQuery,
            tab: activeTab
          }
        });
        
        setSubmissions(response.data.submissions || mockSubmissions);
        setError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions. Please try again later.');
        // Use mock data for demo
        setSubmissions(mockSubmissions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [filter, sort, searchQuery, activeTab]);

  // Mock data for demonstration
  const mockSubmissions = [
    {
      id: 's1',
      problemId: 'p1',
      problemTitle: 'Two Sum',
      userId: 'user1',
      username: 'alex_coder',
      language: 'JavaScript',
      submissionTime: '2025-03-19T14:23:00Z',
      status: 'accepted',
      runtime: '82 ms',
      memory: '42.3 MB',
      likes: 24,
      commentCount: 5,
      code: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return null;
}`,
      explanation: "I used a hashmap to store each number and its index. For each number, I check if its complement (target - current number) exists in the map. This gives us O(n) time complexity rather than the O(n²) of a brute force approach."
    },
    {
      id: 's2',
      problemId: 'p2',
      problemTitle: 'Longest Palindromic Substring',
      userId: 'user2',
      username: 'pythonista42',
      language: 'Python',
      submissionTime: '2025-03-19T10:45:00Z',
      status: 'accepted',
      runtime: '128 ms',
      memory: '14.2 MB',
      likes: 37,
      commentCount: 8,
      code: `def longestPalindrome(s):
    if not s:
        return ""
    
    start = 0
    max_len = 1
    
    # Helper function to expand around center
    def expand_around_center(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return right - left - 1
    
    for i in range(len(s)):
        # Odd length palindrome
        len1 = expand_around_center(i, i)
        # Even length palindrome
        len2 = expand_around_center(i, i + 1)
        
        # Get the maximum length from the two cases
        length = max(len1, len2)
        
        # Update global maximum if needed
        if length > max_len:
            max_len = length
            start = i - (length - 1) // 2
    
    return s[start:start + max_len]`,
      explanation: "My approach uses the 'expand around center' technique. For each character, I try to expand outwards checking both odd and even length palindromes. This avoids the O(n³) complexity of a naive approach."
    },
    {
      id: 's3',
      problemId: 'p3',
      problemTitle: 'Maximum Subarray',
      userId: 'user3',
      username: 'java_master',
      language: 'Java',
      submissionTime: '2025-03-18T22:10:00Z',
      status: 'rejected',
      runtime: 'N/A',
      memory: 'N/A',
      likes: 5,
      commentCount: 12,
      code: `public int maxSubArray(int[] nums) {
    if (nums == null || nums.length == 0) {
        return 0;
    }
    
    int currentSum = nums[0];
    int maxSum = nums[0];
    
    for (int i = 1; i < nums.length; i++) {
        // Incorrect: should be max(nums[i], currentSum + nums[i])
        currentSum = currentSum + nums[i];
        maxSum = Math.max(maxSum, currentSum);
        
        if (currentSum < 0) {
            currentSum = 0;
        }
    }
    
    return maxSum;
}`,
      explanation: "I tried to implement Kadane's algorithm which should be O(n) time complexity. Not sure why it's failing on some test cases."
    },
    {
      id: 's4',
      problemId: 'p4',
      problemTitle: 'Merge Intervals',
      userId: 'user4',
      username: 'cpp_wizard',
      language: 'C++',
      submissionTime: '2025-03-18T16:30:00Z',
      status: 'accepted',
      runtime: '35 ms',
      memory: '18.6 MB',
      likes: 18,
      commentCount: 3,
      code: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty()) {
            return {};
        }
        
        // Sort intervals based on start time
        sort(intervals.begin(), intervals.end(), 
             [](const vector<int>& a, const vector<int>& b) {
                 return a[0] < b[0];
             });
        
        vector<vector<int>> merged;
        merged.push_back(intervals[0]);
        
        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] <= merged.back()[1]) {
                // Overlapping intervals, update end time
                merged.back()[1] = max(merged.back()[1], intervals[i][1]);
            } else {
                // Non-overlapping interval, add to result
                merged.push_back(intervals[i]);
            }
        }
        
        return merged;
    }
};`,
      explanation: "First, I sort the intervals by start time. Then, I iterate through the intervals and either merge them with the previous interval if they overlap, or add them to the result if they don't. This gives an O(n log n) time complexity due to the sorting step."
    }
  ];

  // Mock comments data
  const mockComments = {
    's1': [
      { id: 'c1', userId: 'user5', username: 'debugexpert', content: 'Great solution! Very clean implementation of the hash map approach.', timestamp: '2025-03-19T15:10:00Z', likes: 8 },
      { id: 'c2', userId: 'user6', username: 'algorithm_lover', content: 'You could also solve this with a two-pointer approach if the array is sorted, but this is optimal for unsorted arrays.', timestamp: '2025-03-19T16:05:00Z', likes: 3 }
    ],
    's2': [
      { id: 'c3', userId: 'user7', username: 'code_reviewer', content: 'Excellent use of the expand around center technique! Have you tried Manacher\'s algorithm for this problem?', timestamp: '2025-03-19T11:30:00Z', likes: 5 },
      { id: 'c4', userId: 'user8', username: 'pythonlearner', content: 'Could you explain more about how you handle the odd vs. even length palindromes?', timestamp: '2025-03-19T13:15:00Z', likes: 2 }
    ],
    's3': [
      { id: 'c5', userId: 'user9', username: 'bug_hunter', content: 'I think your issue is in how you\'re updating currentSum. It should be max(nums[i], currentSum + nums[i]) instead of just adding.', timestamp: '2025-03-18T23:05:00Z', likes: 10 },
      { id: 'c6', userId: 'user10', username: 'java_dev', content: 'Also, resetting currentSum to 0 when it\'s negative isn\'t quite right for Kadane\'s algorithm when there are all negative numbers.', timestamp: '2025-03-19T08:45:00Z', likes: 7 }
    ]
  };

  // Toggle code expansion for a submission
  const toggleSubmission = (submissionId) => {
    if (expandedSubmission === submissionId) {
      setExpandedSubmission(null);
    } else {
      setExpandedSubmission(submissionId);
      // Fetch comments for this submission if not already loaded
      if (!comments[submissionId]) {
        fetchComments(submissionId);
      }
    }
  };

  // Toggle comments visibility
  const toggleComments = (submissionId) => {
    setExpandedComments(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId]
    }));
    
    // Fetch comments if not already loaded
    if (!comments[submissionId]) {
      fetchComments(submissionId);
    }
  };

  // Fetch comments for a submission
  const fetchComments = async (submissionId) => {
    try {
      // In a real app, you'd fetch from API
      // const response = await axios.get(`/api/forum/submissions/${submissionId}/comments`);
      // setComments(prev => ({ ...prev, [submissionId]: response.data.comments }));
      
      // Using mock data for demo
      setComments(prev => ({ 
        ...prev, 
        [submissionId]: mockComments[submissionId] || [] 
      }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Add a comment to a submission
  const addComment = async (submissionId, commentText) => {
    if (!commentText.trim()) return;
    
    try {
      // In a real app, you'd post to API
      // const response = await axios.post(`/api/forum/submissions/${submissionId}/comments`, {
      //   content: commentText
      // });
      
      // For demo, simulate adding a comment
      const newComment = {
        id: `c${Date.now()}`,
        userId: 'current-user',
        username: 'current_user',
        content: commentText,
        timestamp: new Date().toISOString(),
        likes: 0
      };
      
      setComments(prev => ({
        ...prev,
        [submissionId]: [...(prev[submissionId] || []), newComment]
      }));

      // Update comment count in submissions
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

  // Like a submission
  const likeSubmission = async (submissionId) => {
    try {
      // In a real app, you'd post to API
      // await axios.post(`/api/forum/submissions/${submissionId}/like`);
      
      // For demo, simulate liking
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

  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Status badge component
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

  // Language badge component
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

  // Comment form component
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

  // Sidebar navigation
  const renderSidebar = () => {
    const commonItems = [
      { icon: <Code className="h-5 w-5" />, label: 'Problems' },
      { icon: <MessageSquare className="h-5 w-5" />, label: 'Discussions' },
      { icon: <Trophy className="h-5 w-5" />, label: 'Leaderboard' },
    ];
    
    const roleSpecificItems = {
      competitor: [
        { icon: <UserCircle className="h-5 w-5" />, label: 'My Profile' },
        { icon: <Database className="h-5 w-5" />, label: 'My Submissions' },
        { icon: <BookOpen className="h-5 w-5" />, label: 'Learning Resources' },
      ],
      admin: [
        { icon: <Users className="h-5 w-5" />, label: 'Manage Users' },
        { icon: <Database className="h-5 w-5" />, label: 'All Submissions' },
      ],
      judge: [
        { icon: <Database className="h-5 w-5" />, label: 'Review Submissions' },
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
                <a href="#" className={`flex items-center px-4 py-3 hover:bg-gray-700 ${item.label === 'Discussions' ? 'bg-gray-700' : ''}`}>
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button 
            onClick={() => setUserRole(userRole === 'competitor' ? 'admin' : userRole === 'admin' ? 'judge' : 'competitor')} 
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

  // Render the submissions list
  const renderSubmissions = () => {
    if (isLoading) {
      return <div className="text-center py-10">Loading submissions...</div>;
    }
    
    if (error) {
      return <div className="text-center py-10 text-red-500">{error}</div>;
    }
    
    if (submissions.length === 0) {
      return <div className="text-center py-10">No submissions found matching your criteria.</div>;
    }
    
    return (
      <div className="space-y-4">
        {submissions.map(submission => (
          <div key={submission.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Submission header */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <a href={`/problems/${submission.problemId}`} className="text-lg font-medium text-blue-600 hover:underline">
                    {submission.problemTitle}
                  </a>
                  <div className="flex items-center mt-1 space-x-2">
                    <a href={`/users/${submission.userId}`} className="text-sm text-gray-600 hover:underline">
                      {submission.username}
                    </a>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(submission.submissionTime)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <LanguageBadge language={submission.language} />
                  <StatusBadge status={submission.status} />
                </div>
              </div>
              
              {/* Metrics row */}
              <div className="flex mt-3 text-sm text-gray-600 space-x-4">
                {submission.status === 'accepted' && (
                  <>
                    <div>
                      <span className="font-medium">Runtime:</span> {submission.runtime}
                    </div>
                    <div>
                      <span className="font-medium">Memory:</span> {submission.memory}
                    </div>
                  </>
                )}
                <div className="flex items-center cursor-pointer" onClick={() => likeSubmission(submission.id)}>
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
            
            {/* Expanded code section */}
            {expandedSubmission === submission.id && (
              <div className="p-4 bg-gray-50">
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">Solution:</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                    <code>{submission.code}</code>
                  </pre>
                </div>
                
                {submission.explanation && (
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2">Explanation:</h3>
                    <p className="text-gray-700">{submission.explanation}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Comments section */}
            {expandedComments[submission.id] && (
              <div className="p-4 bg-gray-100 border-t">
                <h3 className="text-md font-medium mb-2">Comments:</h3>
                {comments[submission.id] && comments[submission.id].length > 0 ? (
                  <div className="space-y-3">
                    {comments[submission.id].map(comment => (
                      <div key={comment.id} className="bg-white p-3 rounded shadow-sm">
                        <div className="flex justify-between">
                          <a href={`/users/${comment.userId}`} className="font-medium text-blue-600 hover:underline">
                            {comment.username}
                          </a>
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
        
        {/* Filters and search */}
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
            <button
              onClick={() => setActiveTab('popular')}
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'popular' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-blue-500'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'recent' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-blue-500'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setActiveTab('my-submissions')}
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'my-submissions' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-blue-500'
              }`}
            >
              My Submissions
            </button>
          </div>
        </div>
        
        {/* Submissions list */}
        {renderSubmissions()}
      </div>
    </div>
  );
};

export default SubmissionsForumPage;