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

  useEffect(() => {
    fetchProblems();
  }, [token, searchTerm, difficultyFilter, sortBy, sortOrder]);

  const fetchProblems = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        difficulty: difficultyFilter,
        sortBy,
        sortOrder
      });

      const response = await axios.get(`/api/problems?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      setProblems(response.data.problems || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
      Easy: 'bg-green-100 text-green-800 border-green-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Hard: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`${styles[difficulty]} text-xs px-2.5 py-0.5 rounded-full border`}>
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
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search problems..."
        className="flex-1"
      />

      <select
        value={difficultyFilter}
        onChange={(e) => setDifficultyFilter(e.target.value)}
        className="px-3 py-2 border rounded-lg bg-white"
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
        className="px-3 py-2 border rounded-lg bg-white"
      >
        <option value="title-asc">Title (A-Z)</option>
        <option value="title-desc">Title (Z-A)</option>
        <option value="difficulty-asc">Difficulty (Easy-Hard)</option>
        <option value="difficulty-desc">Difficulty (Hard-Easy)</option>
        <option value="points-asc">Points (Low-High)</option>
        <option value="points-desc">Points (High-Low)</option>
      </select>
    </div>
  );

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
              onClick={() => navigate('/problems/new')}
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>{tableHeaders}</thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {problems.map((problem) => (
                <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                  {userRole === 'admin' ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{problem.title}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/problems/edit/${problem.id}`)}
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(problem)}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user?.username || 'User'}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {userRole === 'admin' && (
                  <Button
                    variant="primary"
                    onClick={() => navigate('/problems/new')}
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
        message={`Are you sure you want to delete "${deleteModal.problem?.title}"? This action cannot be undone.`}
        confirmText="Delete Problem"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CodeExamDashboard;