import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Trophy, Calendar, Users, Plus, Filter, ChevronDown,
  Clock, Tag, X, Menu, Search, Code, Database, BookOpen,
  FileText, MessageSquare, Inbox, User, LogOut
} from 'lucide-react';

import API from '../../components/helpers/API';
import { logout } from '../../redux/slices/authSlice'; // Add this import

// Components
import Sidebar from '../../components/Sidebar';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SearchBar } from '../../components/SearchBar';
import { Pagination } from '../../components/Pagination';
import CompetitionCard from '../../components/competition/CompetitionCard';

const CompetitionListPage = () => {
  // State for competitions data
  const [competitions, setCompetitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Filter state with debounced search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userRole, user, token } = useSelector(state => state.auth);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, sortBy, sortOrder]);

  // Toggle mobile sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Toggle filter visibility on mobile
  const toggleFilters = () => setFiltersVisible(!filtersVisible);

  // Navigation handlers
  const handleCreateCompetition = () => {
    navigate('/competition/new');
  };

  const handleViewCompetition = (id) => {
    navigate(`/competitions/${id}`);
  };

  const handleEditCompetition = (id) => {
    navigate(`/competition/edit/${id}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setStatusFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  // Fetch competitions from API with filters
  const fetchCompetitions = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder
      });

      // Add optional filters
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim());
      }

      const response = await API.get(`/api/competitions?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      console.log({ response, responseData: response.data });

      if (response.data.success) {
        const competitionsData = response.data.data || [];
        const count = response.data.count || response.data.total || 0;
        
        setCompetitions(competitionsData);
        setTotalCount(count);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load competitions');
        setCompetitions([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error fetching competitions:', err);
      setError('Failed to load competitions. Please try again later.');
      setCompetitions([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch competitions when dependencies change
  useEffect(() => {
    if (token) {
      fetchCompetitions();
    }
  }, [token, debouncedSearchTerm, statusFilter, sortBy, sortOrder, currentPage]);

  // Skeleton loader for better UX during loading
  const renderSkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, index) => (
        <Card key={index} className="p-0 overflow-hidden animate-pulse">
          <div className="h-2 w-full bg-gray-200"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-2 flex-shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-2 flex-shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Enhanced Mobile sidebar component with complete menu structure matching desktop sidebar
  const MobileSidebar = () => {
    // Define navigation items based on user role (same logic as desktop sidebar)
    const getNavigationItems = (role) => {
      const commonItems = [
        {
          icon: <Database className="h-5 w-5" />,
          label: 'Problems',
          path: '/dashboard',
          active: location.pathname === '/dashboard' || location.pathname === '/'
        },
        {
          icon: <Trophy className="h-5 w-5" />,
          label: 'Competitions',
          path: '/competitions',
          active: location.pathname.startsWith('/competitions')
        },
        {
          icon: <BookOpen className='h-5 w-5' />,
          label: 'Discussions',
          path: '/discussions',
          active: location.pathname === '/discussions'
        },
        {
          icon: <User className='h-5 w-5' />,
          label: 'Profile',
          path: '/profile',
          active: location.pathname === '/profile'
        }
      ];

      const roleSpecificItems = {
        competitor: [
          { 
            icon: <FileText className="h-5 w-5" />, 
            label: 'My Submissions', 
            path: '/my-submissions',
            active: location.pathname === '/my-submissions'
          },
          {
            icon: <MessageSquare className="h-5 w-5" />,
            label: 'Submit Feedback',
            path: '/feedback',
            active: location.pathname === '/feedback'
          },
        ],
        admin: [
          {
            icon: <Users className="h-5 w-5" />,
            label: 'User Management',
            path: '/manage/users',
            active: location.pathname === '/manage/users'
          },
          { 
            icon: <Inbox className="h-5 w-5" />, 
            label: 'Manage Feedback', 
            path: '/manage/feedback',
            active: location.pathname === '/manage/feedback'
          },
        ],
        judge: [
          { 
            icon: <MessageSquare className="h-5 w-5" />, 
            label: 'Feedback', 
            path: '/feedback',
            active: location.pathname === '/feedback'
          },
        ]
      };

      return [...commonItems, ...(roleSpecificItems[role] || [])];
    };

    const navigationItems = getNavigationItems(userRole);

    // Handler for navigation
    const handleNavigation = (path) => {
      navigate(path);
      setSidebarOpen(false); // Close sidebar after navigation
    };

    // Handle logout
    const handleLogout = () => {
      dispatch(logout());
      navigate('/login');
      setSidebarOpen(false);
    };

    return (
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-30 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      >
        <div
          className={`fixed inset-y-0 left-0 max-w-xs w-full bg-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">CodeExam</h1>
                <div className="text-sm text-gray-400">
                  <span className="font-medium text-gray-200 capitalize">{userRole}</span>
                  {user && (
                    <div className="text-xs mt-1">
                      {user.username}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto py-4 px-2">
            <nav>
              <ul className="space-y-1">
                {navigationItems.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors duration-200 ${
                        item.active
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className={`${item.active ? 'text-white' : 'text-gray-400'} transition-colors mr-3 flex-shrink-0`}>
                        {item.icon}
                      </span>
                      <span className="font-medium truncate">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-700 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 text-sm flex items-center justify-center transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Page header component with role-specific content
  const renderHeader = () => {
    let title, description;

    switch (userRole) {
      case 'admin':
        title = "Competition Management";
        description = "Create and manage coding competitions";
        break;
      case 'judge':
        title = "Competitions";
        description = "Review and judge competition submissions";
        break;
      default:
        title = "Coding Competitions";
        description = "Join competitions to improve your skills and compete with others";
    }

    return (
      <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{title}</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">{description}</p>
          </div>

          {userRole === 'admin' && (
            <Button
              onClick={handleCreateCompetition}
              className="w-full sm:w-auto flex-shrink-0 group relative inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus
                size={18}
                className="mr-2 transition-transform group-hover:rotate-90 duration-300"
              />
              <span>Create Competition</span>
            </Button>
          )}
        </div>
      </Card>
    );
  };

  // Enhanced filters section with better responsive design
  const renderFilters = () => (
    <Card className="p-4 mb-4 sm:mb-6">
      {/* Mobile Filters Toggle */}
      <div className="sm:hidden flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">Search & Filters</h3>
        <button
          onClick={toggleFilters}
          className="text-blue-600 flex items-center space-x-1 p-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <span className="text-sm">{filtersVisible ? 'Hide' : 'Show'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter content */}
      <div className={`${filtersVisible ? 'block' : 'hidden sm:block'}`}>
        <div className="flex flex-col gap-4">
          {/* Search bar - full width on mobile */}
          <div className="w-full">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search competitions..."
              className="w-full"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <label htmlFor="status-filter" className="text-xs text-gray-500 mb-1 block">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="past">Past</option>
              </select>
              <Filter size={16} className="absolute right-3 top-8 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <label htmlFor="sort-by" className="text-xs text-gray-500 mb-1 block">Sort By</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="participants">Participants</option>
              </select>
              <Filter size={16} className="absolute right-3 top-8 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <label htmlFor="sort-order" className="text-xs text-gray-500 mb-1 block">Order</label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
              <Filter size={16} className="absolute right-3 top-8 text-gray-400 pointer-events-none" />
            </div>

            {/* Results count and clear filters */}
            <div className="flex flex-col justify-end gap-2">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{totalCount}</span> competition{totalCount !== 1 ? 's' : ''}
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // Enhanced competitions grid section
  const renderCompetitionCards = () => {
    if (isLoading) {
      return renderSkeletonLoader();
    }

    if (error) {
      return (
        <Card className="p-6 text-center">
          <div className="text-red-500 mb-4 text-sm sm:text-base">{error}</div>
          <Button onClick={fetchCompetitions} className="px-6 py-2">Try Again</Button>
        </Card>
      );
    }

    if (competitions.length === 0) {
      const hasFilters = searchTerm || statusFilter !== 'all';
      
      return (
        <Card className="p-6 sm:p-8 text-center">
          <div className="text-gray-500 mb-4 text-sm sm:text-base">
            {hasFilters ? 'No competitions match your filters' : 'No competitions found'}
          </div>
          {hasFilters ? (
            <Button
              onClick={clearFilters}
              className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out rounded-lg"
            >
              Clear Filters
            </Button>
          ) : userRole === 'admin' && (
            <Button
              onClick={handleCreateCompetition}
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out rounded-lg shadow-sm hover:shadow-md"
            >
              <Plus size={18} className="mr-2" />
              <span>Create New Competition</span>
            </Button>
          )}
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {competitions.map((competition) => (
          <CompetitionCard
            key={competition.id}
            competition={competition}
            userRole={userRole}
            onView={() => handleViewCompetition(competition.id)}
            onEdit={userRole === 'admin' ? () => handleEditCompetition(competition.id) : null}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white p-4 shadow-sm border-b sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-2">
              <Trophy className="text-blue-600" size={24} />
              <span className="font-bold text-lg sm:text-xl">Competitions</span>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          {renderHeader()}

          {/* Filters Section */}
          {renderFilters()}

          {/* Competition Cards Grid */}
          {renderCompetitionCards()}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 sm:mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="flex justify-center"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionListPage;