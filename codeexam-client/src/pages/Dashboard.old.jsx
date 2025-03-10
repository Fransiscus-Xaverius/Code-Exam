import React, { useState, useEffect } from 'react';
import { UserCircle, Code, Trophy, Users, Settings, Clock, Database, CheckCircle, XCircle, HelpCircle, LogOut } from 'lucide-react';
import axios from 'axios'; // Make sure to import axios

const CodeExamDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [userRole, setUserRole] = useState('competitor'); // Default role
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [competitionStatus, setCompetitionStatus] = useState('upcoming'); // 'upcoming', 'active', 'ended'
  const [error, setError] = useState(null); // Add error state

  const mockCompetitionDetails = {
    name: "Spring Coding Challenge 2025",
    startTime: "2025-03-10T18:00:00Z",
    endTime: "2025-03-10T22:00:00Z",
    participants: 256,
    leaderboardVisible: true
  };
  // /api/problems

  // Simulation of data fetching
  useEffect(() => {
    // Fetch problems from API
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('codeexam_token');
        
        // Make API request with authorization header
        const response = await axios.get('/api/problems', {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });
        
        // Set problems from response
        setProblems(response.data.problems);
        setError(null);
      } catch (err) {
        console.error('Error fetching problems:', err);
        setError('Failed to load problems. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    // Call the fetch function
    fetchProblems();

    // Update competition status based on current time
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const startTime = new Date(mockCompetitionDetails.startTime);
      const endTime = new Date(mockCompetitionDetails.endTime);
      
      if (now < startTime) {
        setCompetitionStatus('upcoming');
      } else if (now >= startTime && now <= endTime) {
        setCompetitionStatus('active');
      } else {
        setCompetitionStatus('ended');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Role toggle for demo purposes
  const toggleRole = () => {
    if (userRole === 'competitor') setUserRole('admin');
    else if (userRole === 'admin') setUserRole('judge');
    else setUserRole('competitor');
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('codeexam_token');
    window.location.href = '/login';
  };

  // Difficulty badge component
  const DifficultyBadge = ({ difficulty }) => {
    const colorClass = 
      difficulty === 'Easy' ? 'bg-green-500' : 
      difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <span className={`${colorClass} text-white text-xs px-2 py-1 rounded-full`}>
        {difficulty}
      </span>
    );
  };

  // Status indicator component
  const StatusIndicator = ({ solved }) => {
    return solved ? 
      <CheckCircle className="text-green-500 h-5 w-5" /> : 
      <HelpCircle className="text-gray-400 h-5 w-5" />;
  };

  // Competition timer component
  const CompetitionTimer = () => {
    const getTimeRemaining = () => {
      const startTime = new Date(mockCompetitionDetails.startTime);
      const endTime = new Date(mockCompetitionDetails.endTime);
      
      if (competitionStatus === 'upcoming') {
        const diff = startTime - currentTime;
        return formatTime(diff);
      } else if (competitionStatus === 'active') {
        const diff = endTime - currentTime;
        return formatTime(diff);
      }
      return '00:00:00';
    };
    
    const formatTime = (ms) => {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    const statusColors = {
      'upcoming': 'bg-blue-500',
      'active': 'bg-green-500',
      'ended': 'bg-gray-500'
    };
    
    const statusText = {
      'upcoming': 'Starting in',
      'active': 'Time remaining',
      'ended': 'Competition ended'
    };
    
    return (
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5" />
        <span className={`px-2 py-1 rounded ${statusColors[competitionStatus]} text-white text-sm`}>
          {statusText[competitionStatus]}
        </span>
        <span className="font-mono font-bold">{getTimeRemaining()}</span>
      </div>
    );
  };

  // Render different tables based on role
  const renderProblemsList = () => {
    if (isLoading) {
      return <div className="text-center py-4">Loading problems...</div>;
    }
    
    if (userRole === 'competitor') {
      return (
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {problems.map((problem) => (
              <tr key={problem.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusIndicator solved={problem.solved} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium">{problem.title}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <DifficultyBadge difficulty={problem.difficulty} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{problem.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (userRole === 'admin') {
      return (
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {problems.map((problem) => (
              <tr key={problem.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">{problem.id}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium">{problem.title}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <DifficultyBadge difficulty={problem.difficulty} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{problem.points}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{problem.submissions}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:underline mr-2">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="6" className="px-4 py-3">
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Add New Problem
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      );
    } else if (userRole === 'judge') {
      return (
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {problems.map((problem) => (
              <tr key={problem.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">{problem.id}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium">{problem.title}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <DifficultyBadge difficulty={problem.difficulty} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{problem.submissions}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{problem.acceptance}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs">
                    View Submissions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  // Competition details panel
  const renderCompetitionDetails = () => {
    return (
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-lg font-semibold mb-4">{mockCompetitionDetails.name}</h2>
        
        <div className="mb-4">
          <CompetitionTimer />
        </div>
        
        {userRole === 'competitor' && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Your Rank:</span>
              <span className="font-semibold">42 / {mockCompetitionDetails.participants}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Points:</span>
              <span className="font-semibold">100 / 1700</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Problems Solved:</span>
              <span className="font-semibold">1 / 9</span>
            </div>
            <button className="w-full mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              View Leaderboard
            </button>
          </div>
        )}
        
        {userRole === 'admin' && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Participants:</span>
              <span className="font-semibold">{mockCompetitionDetails.participants}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Users:</span>
              <span className="font-semibold">187</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Leaderboard Visible:</span>
              <span className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" checked={mockCompetitionDetails.leaderboardVisible} 
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                <label className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer 
                  ${mockCompetitionDetails.leaderboardVisible ? 'bg-green-400' : ''}`}></label>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Edit Competition
              </button>
              <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
                End Competition
              </button>
            </div>
          </div>
        )}
        
        {userRole === 'judge' && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Submissions:</span>
              <span className="font-semibold">423</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Reviews:</span>
              <span className="font-semibold text-yellow-500">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Latest Submission:</span>
              <span className="font-semibold">2 minutes ago</span>
            </div>
            <button className="w-full mt-2 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600">
              Review Pending Submissions
            </button>
          </div>
        )}
      </div>
    );
  };

  // Sidebar navigation based on role
  const renderSidebar = () => {
    const commonItems = [
      { icon: <Code className="h-5 w-5" />, label: 'Problems' },
      { icon: <Trophy className="h-5 w-5" />, label: 'Leaderboard' },
    ];
    
    const roleSpecificItems = {
      competitor: [
        { icon: <UserCircle className="h-5 w-5" />, label: 'My Profile' },
        { icon: <Database className="h-5 w-5" />, label: 'My Submissions' },
      ],
      admin: [
        { icon: <Users className="h-5 w-5" />, label: 'Participants' },
        { icon: <Settings className="h-5 w-5" />, label: 'Competition Settings' },
        { icon: <Database className="h-5 w-5" />, label: 'All Submissions' },
      ],
      judge: [
        { icon: <Database className="h-5 w-5" />, label: 'Review Submissions' },
        { icon: <Users className="h-5 w-5" />, label: 'Judge Panel' },
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
        <div className="absolute bottom-4 left-0 right-0 px-4 space-y-2">
          <button 
            onClick={toggleRole} 
            className="w-full bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm"
          >
            Switch Role (Demo)
          </button>
          <button 
            onClick={handleLogout} 
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm flex items-center justify-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {renderSidebar()}
      <div className="ml-64 flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Competition Overview</h1>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">Current Role:</span>
            <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm capitalize">{userRole}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded shadow-md overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="font-semibold">List of Problems</h2>
              {userRole === 'admin' && (
                <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                  Add Problem
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              {renderProblemsList()}
            </div>
          </div>
          
          <div className="col-span-1">
            {renderCompetitionDetails()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExamDashboard;