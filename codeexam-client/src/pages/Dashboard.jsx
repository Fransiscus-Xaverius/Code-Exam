import React, { useState, useEffect, useCallback } from 'react';
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [activeCompetition, setActiveCompetition] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userRole, isAuthenticated, user, token } = useSelector(state => state.auth);

  // Define the number of items per page
  const itemsPerPage = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, difficultyFilter, sortBy, sortOrder]);

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

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setDifficultyFilter('all');
    setSortBy('title');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Fetch problems from API
  const fetchProblems = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      // Add filters if they're not default values
      if (difficultyFilter !== 'all') {
        params.append('difficulty', difficultyFilter);
      }

      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim());
      }

      // Add sorting parameters
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      console.log('API Request URL:', `/api/problems?${params.toString()}`);

      const response = await API.get(`/api/problems?${params.toString()}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      console.log('API Response:', response.data);

      // Update to match the server response structure
      if (response.data.success) {
        setProblems(response.data.problems || []);
        setTotalCount(response.data.count || 0);
        setTotalPages(Math.ceil((response.data.count || 0) / itemsPerPage));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load problems');
        setProblems([]);
        setTotalCount(0);
        setTotalPages(1);
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
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [token, userRole, debouncedSearchTerm, difficultyFilter, sortBy, sortOrder, currentPage, itemsPerPage]);

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
        title = "Problem Dashboard";
        description = "Solve problems and improve your coding skills";
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

  const renderFilters = () => {
    const hasActiveFilters = debouncedSearchTerm.trim() || difficultyFilter !== 'all' || sortBy !== 'title' || sortOrder !== 'asc';
    
    return (
      <Card className="p-4 sm:p-6 mb-6 border border-gray-200 shadow-sm">
        {/* Mobile Filters Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-gray-500" />
            <h3 className="font-semibold text-gray-800">Search & Filters</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <button
            onClick={toggleFilters}
            className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <span className="font-medium">{filtersVisible ? 'Hide' : 'Show'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${filtersVisible ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter content - always visible on desktop, toggleable on mobile */}
        <div className={`${filtersVisible ? 'block' : 'hidden lg:block'}`}>
          {/* Search Bar */}
          <div className="mb-4 lg:mb-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search problems by title or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            {/* Difficulty Filter */}
            <div className="flex-1 lg:max-w-xs">
              <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="relative">
                <select
                  id="difficulty-filter"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none pr-10 text-sm"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort By Filter */}
            <div className="flex-1 lg:max-w-xs">
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="relative">
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none pr-10 text-sm"
                >
                  <option value="title">Title</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="points">Points</option>
                  <option value="created_at">Created Date</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort Order Filter */}
            <div className="flex-1 lg:max-w-xs">
              <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <div className="relative">
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none pr-10 text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex-shrink-0">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {!isLoading && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600">
                <div>
                  Showing {problems.length} of {totalCount} problems
                  {hasActiveFilters && ' (filtered)'}
                </div>
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {debouncedSearchTerm && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Search: "{debouncedSearchTerm}"
                      </span>
                    )}
                    {difficultyFilter !== 'all' && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {difficultyFilter}
                      </span>
                    )}
                    {(sortBy !== 'title' || sortOrder !== 'asc') && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Sort: {sortBy} ({sortOrder})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

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
  }, [fetchProblems, token, navigate]);

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