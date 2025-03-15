import React, { useState, useEffect } from 'react';
import { UserCircle, Code, Trophy, Users, Settings, Database, CheckCircle, HelpCircle, LogOut, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleUserRole, logout } from '../redux/slices/authSlice';
import Sidebar from '../components/Sidebar';
import { ConfirmationModal } from '../components/Modal';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SearchBar } from '../components/SearchBar';

const CodeExamDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, problem: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userRole, isAuthenticated, user, token } = useSelector(state => state.auth);

  // Add the handleAddNewProblem function inside the component
  const handleAddNewProblem = () => {
    navigate('/problem/new');
  };

  const fetchProblems = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: 1,
        limit: 10
      });

      // Add filters if they're not default values
      if (difficultyFilter !== 'all') {
        params.append('difficulty', difficultyFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`/api/problems?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      // Update to match the server response structure
      if (response.data.success) {
        setProblems(response.data.problems || []);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load problems');
        setProblems([]);
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems. Please try again later.');
      setProblems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the problems mapping in renderProblemsList
  const renderProblemsList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="p-6 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={fetchProblems}>Try Again</Button>
        </Card>
      );
    }

    if (problems.length === 0) {
      return (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">No problems found</div>
          {userRole === 'admin' && (
            <Button
              onClick={handleAddNewProblem}
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out rounded-lg shadow-sm hover:shadow-md"
            >
              <Plus size={18} className="mr-2 animate-pulse" />
              <span className="relative inline-block">
                Add New Problem
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              </span>
            </Button>
          )}
        </Card>
      );
    }

    const tableHeaders = userRole === 'admin' ? (
      <tr className="bg-gray-50 border-b">
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
      </tr>
    ) : (
      <tr className="bg-gray-50 border-b">
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
      </tr>
    );

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>{tableHeaders}</thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {problems.map((problem) => (
                <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                  {userRole === 'admin' ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/problems/${problem.id}`)}>
                          {problem.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {problem.points} points
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(problem.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => navigate(`/problem/edit/${problem.id}`)}
                            className="group relative flex items-center justify-center p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            title="Edit Problem"
                          >
                            <Edit size={16} className="group-hover:scale-110 transition-transform duration-200" />
                            <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                              Edit Problem
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(problem)}
                            className="group relative flex items-center justify-center p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            title="Delete Problem"
                          >
                            <Trash2 size={16} className="group-hover:scale-110 transition-transform duration-200" />
                            <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                              Delete Problem
                            </span>
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusIndicator solved={problem.solved} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{problem.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {problem.points} points
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/solve/${problem.id}`)}
                        >
                          Solve Problem
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Add useEffect dependency array
  useEffect(() => {
    if (token) {
      fetchProblems();
    }
  }, [token, searchTerm, difficultyFilter, sortBy, sortOrder]);

  const handleToggleRole = () => {
    dispatch(toggleUserRole());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleDeleteClick = (problem) => {
    setDeleteModal({ isOpen: true, problem });
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/problems/${deleteModal.problem.id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      setProblems(problems.filter(p => p.id !== deleteModal.problem.id));
      setDeleteModal({ isOpen: false, problem: null });
    } catch (err) {
      console.error('Error deleting problem:', err);
      setError('Failed to delete problem. Please try again.');
    }
  };

  const DifficultyBadge = ({ difficulty }) => {
    const styles = {
      Easy: 'bg-green-100 text-green-800 border-green-200 shadow-sm shadow-green-100',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm shadow-yellow-100',
      Hard: 'bg-red-100 text-red-800 border-red-200 shadow-sm shadow-red-100'
    };

    return (
      <span className={`${styles[difficulty]} text-xs px-2.5 py-0.5 rounded-full border inline-flex items-center justify-center font-medium`}>
        {difficulty}
      </span>
    );
  };

  const StatusIndicator = ({ solved }) => (
    <div className="flex items-center">
      {solved ? (
        <div className="flex items-center text-green-600">
          <CheckCircle size={16} className="mr-1" />
          <span className="text-sm">Solved</span>
        </div>
      ) : (
        <div className="flex items-center text-gray-400">
          <HelpCircle size={16} className="mr-1" />
          <span className="text-sm">Unsolved</span>
        </div>
      )}
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search problems..."
          className="flex-1"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="difficulty-asc">Difficulty (Easy-Hard)</option>
            <option value="difficulty-desc">Difficulty (Hard-Easy)</option>
            <option value="points-asc">Points (Low-High)</option>
            <option value="points-desc">Points (High-Low)</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Problem Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Welcome back, <span className="font-medium text-blue-600">{user?.username || 'User'}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {userRole === 'admin' && (
                    <Button
                      variant="primary"
                      onClick={handleAddNewProblem}
                      className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus 
                        size={18} 
                        className="mr-2 transition-transform group-hover:rotate-90 duration-300" 
                      />
                      <span className="relative inline-block">
                        Add New Problem
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      </span>
                      <span className="absolute -z-10 inset-0 rounded-lg bg-gradient-to-br from-blue-600/50 to-blue-700/50 blur opacity-0 group-hover:opacity-75 transition-opacity duration-200"></span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {renderFilters()}
            {renderProblemsList()}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, problem: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Problem"
        message={
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Problem</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteModal.problem?.title}"</span>? This action cannot be undone.
            </p>
          </div>
        }
        confirmText="Delete Problem"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CodeExamDashboard;