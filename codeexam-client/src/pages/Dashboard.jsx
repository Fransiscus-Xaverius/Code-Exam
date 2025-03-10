import React, { useState, useEffect } from 'react';
import { UserCircle, Code, Trophy, Users, Settings, Database, CheckCircle, HelpCircle, LogOut } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const CodeExamDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [userRole, setUserRole] = useState('competitor'); // Default role
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();


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

  // Render different tables based on role
  const renderProblemsList = () => {
    if (isLoading) {
      return <div className="text-center py-4">Loading problems...</div>;
    }
    
    if (error) {
      return <div className="text-center py-4 text-red-500">{error}</div>;
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button onClick={() => navigate(`/solve/${problem.id}`)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs">
                    Solve
                  </button>
                </td>
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
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">Current Role:</span>
            <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm capitalize">{userRole}</span>
          </div>
        </div>
        
        <div className="bg-white rounded shadow-md overflow-hidden">
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
      </div>
    </div>
  );
};

export default CodeExamDashboard;