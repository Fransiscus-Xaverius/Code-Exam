import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Trophy, Calendar, Users, Plus, Filter, ChevronDown,
  Clock, Tag, X, Menu, Search, Code
} from 'lucide-react';

import API from '../../components/helpers/API'

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

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'upcoming', 'active', 'past'
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9; // Show more competitions per page than problems

  const navigate = useNavigate();
  const { userRole, user, token } = useSelector(state => state.auth);

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

  // Fetch competitions from API
  const fetchCompetitions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await API.get(`/api/competitions?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      console.log({ response, responseData: response.data })

      if (response.data.success) {
        setCompetitions(response.data.data || []);
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load competitions');
        setCompetitions([]);
      }
    } catch (err) {
      console.error('Error fetching competitions:', err);
      setError('Failed to load competitions. Please try again later.');
      setCompetitions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCompetitions();
    }
  }, [token, searchTerm, statusFilter, sortBy, sortOrder, currentPage]);

  // Skeleton loader for better UX during loading
  const renderSkeletonLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="p-0 overflow-hidden animate-pulse">
          <div className="h-2 w-full bg-gray-200"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Mobile sidebar component - similar to Dashboard.jsx
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
            <Trophy className="text-blue-600" size={24} />
            <span className="font-bold text-xl">Competitions</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Same sidebar content as in Dashboard.jsx */}
        <div className="p-4">
          <div className="flex items-center p-3 mb-6 bg-blue-50 rounded-lg">
            <Users className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="font-medium">{user?.username || 'User'}</p>
              <p className="text-sm text-gray-500">
                {userRole === 'admin' ? 'Administrator' :
                  userRole === 'judge' ? 'Judge' : 'Competitor'}
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            <a href="/dashboard" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Code className="mr-3" size={20} />
              <span>Problems</span>
            </a>
            <a href="/competitions" className="flex items-center p-3 text-blue-600 bg-blue-50 rounded-lg font-medium">
              <Trophy className="mr-3" size={20} />
              <span>Competitions</span>
            </a>
            {/* Other nav items from Dashboard.jsx */}
          </nav>
        </div>
      </div>
    </div>
  );

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
      default: // competitor
        title = "Coding Competitions";
        description = "Join competitions to improve your skills and compete with others";
    }

    return (
      <Card className="p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>

          {userRole === 'admin' && (
            <Button
              onClick={handleCreateCompetition}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
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

  // Filters section - similar to Dashboard.jsx
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
            placeholder="Search competitions..."
            className="w-full md:flex-1"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:w-auto md:flex md:gap-4">
            <div className="relative">
              <label htmlFor="status-filter" className="text-xs text-gray-500 mb-1 block">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full appearance-none pr-8"
              >
                <option value="all">All Competitions</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="past">Past</option>
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
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="participants-desc">Most Popular</option>
              </select>
              <Filter size={16} className="absolute right-3 bottom-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // Competitions grid section
  const renderCompetitionCards = () => {
    if (isLoading) {
      return renderSkeletonLoader();
    }

    if (error) {
      return (
        <Card className="p-6 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={fetchCompetitions}>Try Again</Button>
        </Card>
      );
    }

    if (competitions.length === 0) {
      return (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">No competitions found</div>
          {userRole === 'admin' && (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Trophy className="text-blue-600" size={24} />
              <span className="font-bold text-xl">Competitions</span>
            </div>
            {/* Right side spacer for symmetry */}
            <div className="w-10"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            {/* Page header */}
            {renderHeader()}

            {/* Filters section */}
            {renderFilters()}

            {/* Competition cards */}
            {renderCompetitionCards()}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionListPage;