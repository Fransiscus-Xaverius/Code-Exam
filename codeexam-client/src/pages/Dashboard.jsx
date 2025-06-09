import React, { useState, useEffect } from 'react';
import {
  UserCircle, Code, Trophy, Users, Settings, Database, CheckCircle,
  HelpCircle, LogOut, Edit, Trash2, Plus, Search, Filter, Menu, X,
  ChevronDown, FileText, Clock, Calendar, AlertTriangle, BarChart2
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  // toggleUserRole,
  logout
} from '../redux/slices/authSlice';

// // Component imports
import Sidebar from '../components/Sidebar';
import { ConfirmationModal } from '../components/Modal';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import ProblemsList from '../components/dashboard/ProblemsList';
// import DifficultyBadge from '../components/dashboard/DifficultyBadge';
// import StatusIndicator from '../components/dashboard/StatusIndicator';

import API from '../components/helpers/API'

const CodeExamDashboard = () => {
  // State management
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, problem: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [activeCompetition, setActiveCompetition] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userRole, isAuthenticated, user, token } = useSelector(state => state.auth);

  // Define the number of items per page
  const itemsPerPage = 10;

  // Toggle mobile sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Toggle filter visibility on mobile
  const toggleFilters = () => setFiltersVisible(!filtersVisible);

  // Add new problem handler
  const handleAddNewProblem = () => {
    navigate('/problem/new');
  };

  // Handle review submissions (for judge role)
  const handleReviewSubmissions = () => {
    navigate('/submissions/pending');
  };

  // Fetch problems from API
  const fetchProblems = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });

      // Add filters if they're not default values
      if (difficultyFilter !== 'all') {
        params.append('difficulty', difficultyFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Add sorting parameters
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await API.get(`/api/problems?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      // Update to match the server response structure
      if (response.data.success) {
        setProblems(response.data.problems || []);
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load problems');
        setProblems([]);
      }

      // For judge role, fetch pending submissions count
      if (userRole === 'judge') {
        try {
          const submissionsResponse = await API.get('/api/submissions/pending', {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
          });

          if (submissionsResponse.data.success) {
            setPendingSubmissions(submissionsResponse.data.count || 0);
          }
        } catch (err) {
          console.error('Error fetching pending submissions:', err);
        }
      }

      // For competitor role, check if there's an active competition
      if (userRole === 'competitor') {
        try {
          const competitionsResponse = await API.get('/api/competitions/active', {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
          });

          if (competitionsResponse.data.success && competitionsResponse.data.competition) {
            setActiveCompetition(competitionsResponse.data.competition);
          } else {
            setActiveCompetition(null);
          }
        } catch (err) {
          console.error('Error fetching active competition:', err);
          setActiveCompetition(null);
        }
      }

    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems. Please try again later.');
      setProblems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Skeleton loader for better UX during loading
  const renderSkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-4 w-4 bg-gray-200 rounded-full hidden sm:block"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 sm:w-48"></div>
            </div>
            <div className="flex items-center gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-24 ml-auto sm:ml-0"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render the competition timer component (for competitor role)
  const CompetitionTimer = ({ competition }) => {
    const [timeRemaining, setTimeRemaining] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
      const calculateTimeRemaining = () => {
        const now = new Date().getTime();
        const startTime = new Date(competition.start_time).getTime();
        const endTime = new Date(competition.end_time).getTime();

        if (now < startTime) {
          // Competition hasn't started yet
          setStatus('upcoming');
          setTimeRemaining(formatTime(startTime - now));
        } else if (now < endTime) {
          // Competition is active
          setStatus('active');
          setTimeRemaining(formatTime(endTime - now));
        } else {
          // Competition has ended
          setStatus('ended');
          setTimeRemaining('Competition has ended');
        }
      };

      calculateTimeRemaining();
      const timer = setInterval(calculateTimeRemaining, 1000);

      return () => clearInterval(timer);
    }, [competition]);

    const formatTime = (ms) => {
      const totalSeconds = Math.floor(ms / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      }

      return `${hours}h ${minutes}m ${seconds}s`;
    };

    const statusColors = {
      'upcoming': 'bg-blue-500',
      'active': 'bg-green-500',
      'ended': 'bg-gray-500'
    };

    const statusText = {
      'upcoming': 'Starting in:',
      'active': 'Time remaining:',
      'ended': ''
    };

    return (
      <div className="flex flex-col items-center">
        <div className={`${statusColors[status]} text-white text-xs font-medium px-2.5 py-1 rounded-full mb-2`}>
          {status === 'upcoming' ? 'Upcoming' : status === 'active' ? 'Active' : 'Ended'}
        </div>

        <p className="text-sm text-gray-500">{statusText[status]}</p>
        <p className="text-xl font-bold tracking-tight">{timeRemaining}</p>
      </div>
    );
  };

  // Render active competition card (for competitor role)
  const renderActiveCompetition = () => {
    if (!activeCompetition) return null;

    return (
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{activeCompetition.name}</h2>
            <p className="text-sm text-gray-500">Active Competition</p>
          </div>
          <div className="mt-3 sm:mt-0">
            <CompetitionTimer competition={activeCompetition} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Your Rank</p>
            <p className="text-xl font-bold">{activeCompetition.userRank || '-'} / {activeCompetition.participants}</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Points</p>
            <p className="text-xl font-bold">{activeCompetition.userPoints || 0} / {activeCompetition.totalPoints}</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Problems Solved</p>
            <p className="text-xl font-bold">{activeCompetition.problemsSolved || 0} / {activeCompetition.totalProblems}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => navigate(`/competitions/${activeCompetition.id}`)}
            className="w-full sm:w-auto"
          >
            Go to Competition
          </Button>
        </div>
      </Card>
    );
  };

  // Render judge dashboard summary (for judge role)
  const renderJudgeSummary = () => {
    return (
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Judge Dashboard</h2>
            <p className="text-sm text-gray-500">Pending submissions require your review</p>
          </div>
          {pendingSubmissions > 0 && (
            <Button
              onClick={handleReviewSubmissions}
              className="mt-3 sm:mt-0 w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600"
            >
              <FileText size={18} className="mr-2" />
              Review Pending ({pendingSubmissions})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
            <p className="text-xl font-bold">{pendingSubmissions}</p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Reviews Today</p>
            <p className="text-xl font-bold">12</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
            <p className="text-xl font-bold">438</p>
          </div>
        </div>
      </Card>
    );
  };

  const renderDashboardHeader = () => {
    let title = "Problems";
    let description = "";

    switch (userRole) {
      case 'competitor':
        title = "Problem Dashboard";
        description = "Solve problems and improve your coding skills";
        break;
      case 'admin':
        title = "Problem Management";
        description = "Create, edit, and manage coding problems";
        break;
      case 'judge':
        title = "Judge Dashboard";
        description = "Review, validate, and manage submissions";
        break;
      default:
        title = "Problems Dashboard";
        description = "Welcome to CodeExam";
    }

    return (
      <Card className="p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {description}. Welcome back, <span className="font-medium text-blue-600">{user?.username || 'User'}</span>
            </p>
          </div>

          {userRole === 'admin' && (
            <Button
              onClick={handleAddNewProblem}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus
                size={18}
                className="mr-2 transition-transform group-hover:rotate-90 duration-300"
              />
              <span>Add New Problem</span>
            </Button>
          )}

          {userRole === 'judge' && pendingSubmissions > 0 && (
            <Button
              onClick={handleReviewSubmissions}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <FileText size={18} className="mr-2" />
              <span>Review Pending ({pendingSubmissions})</span>
              {pendingSubmissions > 5 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const renderFilters = () => (
    <Card className="p-4 mb-6">
      {/* Mobile Filters Toggle */}
      <div className="md:hidden flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">Search & Filters</h3>
        <button
          onClick={toggleFilters}
          className="text-blue-600 flex items-center space-x-1"
        >
          <span>{filtersVisible ? 'Hide' : 'Show'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter content - hidden on mobile unless expanded */}
      <div className={`${filtersVisible ? 'block' : 'hidden md:block'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems..."
            className="w-full md:flex-1"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:w-auto md:flex md:gap-4">
            <div className="relative">
              <label htmlFor="difficulty-filter" className="text-xs text-gray-500 mb-1 block">Difficulty</label>
              <select
                id="difficulty-filter"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full appearance-none pr-8"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <Filter size={16} className="absolute right-3 bottom-2.5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <label htmlFor="sort-order" className="text-xs text-gray-500 mb-1 block">Sort By</label>
              <select
                id="sort-order"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full appearance-none pr-8"
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="difficulty-asc">Difficulty (Easy-Hard)</option>
                <option value="difficulty-desc">Difficulty (Hard-Easy)</option>
                <option value="points-asc">Points (Low-High)</option>
                <option value="points-desc">Points (High-Low)</option>
              </select>
              <Filter size={16} className="absolute right-3 bottom-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // Mobile sidebar component
  const MobileSidebar = () => (
    <div
      className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-30 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={toggleSidebar}
    >
      <div
        className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Code className="text-blue-600" size={24} />
            <span className="font-bold text-xl">CodeExam</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center p-3 mb-6 bg-blue-50 rounded-lg">
            <UserCircle className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="font-medium">{user?.username || 'User'}</p>
              <p className="text-sm text-gray-500">
                {userRole === 'admin' ? 'Administrator' :
                  userRole === 'judge' ? 'Judge' : 'Competitor'}
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            <a href="/dashboard" className="flex items-center p-3 text-blue-600 bg-blue-50 rounded-lg font-medium">
              <Database className="mr-3" size={20} />
              <span>Problems</span>
            </a>
            <a href="/competitions" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Trophy className="mr-3" size={20} />
              <span>Competitions</span>
            </a>
            {(userRole === 'admin' || userRole === 'judge') && (
              <a href="/submissions" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="mr-3" size={20} />
                <span>Submissions</span>
              </a>
            )}
            {userRole === 'admin' && (
              <a href="/users" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Users className="mr-3" size={20} />
                <span>Users</span>
              </a>
            )}
            <a href="/settings" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Settings className="mr-3" size={20} />
              <span>Settings</span>
            </a>

            {/* <button
              onClick={handleToggleRole}
              className="flex w-full items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <UserCircle className="mr-3" size={20} />
              <span>Switch Role</span>
            </button> */}

            <button
              onClick={handleLogout}
              className="flex w-full items-center p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="mr-3" size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  // Effects
  useEffect(() => {
    if (token) {
      fetchProblems();
    } else {
      navigate('/login');
    }
  }, [token, userRole, searchTerm, difficultyFilter, sortBy, sortOrder, currentPage, navigate]);

  const handleToggleRole = () => {
    // dispatch(toggleUserRole());
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
      await API.delete(`/api/problems/${deleteModal.problem.id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      // Refresh problems list
      fetchProblems();
      setDeleteModal({ isOpen: false, problem: null });
    } catch (err) {
      console.error('Error deleting problem:', err);
      setError('Failed to delete problem. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 shadow-sm border-b sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-2">
              <Code className="text-blue-600" size={24} />
              <span className="font-bold text-xl">CodeExam</span>
            </div>
            {/* Right side spacer for symmetry */}
            <div className="w-10"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard header with title and main action button */}
            {renderDashboardHeader()}

            {/* Role-specific content sections */}
            {userRole === 'competitor' && activeCompetition && renderActiveCompetition()}
            {userRole === 'judge' && renderJudgeSummary()}

            {/* Filters section */}
            {renderFilters()}

            {/* Problems list */}
            <ProblemsList
              problems={problems}
              isLoading={isLoading}
              error={error}
              userRole={userRole}
              handleAddNewProblem={handleAddNewProblem}
              handleDeleteClick={handleDeleteClick}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              renderSkeletonLoader={renderSkeletonLoader}
              fetchProblems={fetchProblems}
            />
          </div>
        </div>
      </div>

      {/* Confirmation modal for deleting problems */}
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