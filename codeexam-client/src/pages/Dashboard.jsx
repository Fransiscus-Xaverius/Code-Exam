import React, { useState, useEffect } from 'react';
import { UserCircle, Code, Trophy, Users, Settings, Database, CheckCircle, HelpCircle, LogOut } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleUserRole, logout } from '../redux/slices/authSlice';
import Sidebar from '../components/Sidebar';

const CodeExamDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get user data from Redux store
  const { userRole, isAuthenticated, user, token } = useSelector(state => state.auth);

  // Fetch problems from API
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        
        // Use token from Redux store instead of localStorage
        const response = await axios.get('/api/problems', {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });
        
        setProblems(response.data.problems);
        setError(null);
      } catch (err) {
        console.error('Error fetching problems:', err);
        setError('Failed to load problems. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [token]);

  // Toggle role handler using Redux
  const handleToggleRole = () => {
    dispatch(toggleUserRole());
  };

  // Logout handler using Redux
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
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
                <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                  <button 
                    className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors"
                    onClick={()=> navigate(`/problem/edit/${problem.id}`)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition-colors"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this problem?')) {
                        // Add delete logic here
                        console.log('Delete problem:', problem.id);
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="6" className="px-4 py-3">
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => navigate('/problem/new')}
                >
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div>
              <span className="mr-2 text-sm text-gray-600">Current Role:</span>
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm capitalize">{userRole}</span>
            </div>
            {/* For demo purposes - toggles between roles */}
            <button 
              onClick={handleToggleRole} 
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
            >
              Switch Role
            </button>
            {/* Display username if available */}
            {user && (
              <div className="flex items-center">
                <UserCircle className="w-5 h-5 mr-1 text-gray-700" />
                <span className="text-sm text-gray-700">{user.name || user.email}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded shadow-md overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="font-semibold">List of Problems</h2>
            {userRole === 'admin' && (
              <button 
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                onClick={() => navigate('/problem/new')}
              >
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