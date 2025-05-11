import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FileText, Filter, ChevronDown, Search, 
  CheckCircle, XCircle, Clock, AlertTriangle, 
  Code, ChevronRight, Download, Menu, X
} from 'lucide-react';

// Components
import Sidebar from '../components/Sidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Pagination } from '../components/Pagination';
import API from '../components/helpers/API';

const MySubmissionsPage = () => {
  // State management
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Get auth state from Redux store
  const { userRole, token, user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  // Define the number of items per page
  const itemsPerPage = 10;

  // Toggle mobile sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Toggle filter visibility on mobile
  const toggleFilters = () => setFiltersVisible(!filtersVisible);

  // Fetch submissions from API
  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });

      // Add filters if they're not default values
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      if (languageFilter) {
        params.append('language', languageFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Add sorting parameters
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await API.get(`/api/submissions?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      if (response.data.success) {
        setSubmissions(response.data.submissions || []);
        setTotalSubmissions(response.data.count || 0);
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load submissions');
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please try again later.');
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view submission details
  const handleViewSubmission = (id) => {
    navigate(`/submissions/${id}`);
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter('');
    setLanguageFilter('');
    setSearchTerm('');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Effects
  useEffect(() => {
    if (token) {
      fetchSubmissions();
    } else {
      navigate('/login');
    }
  }, [token, statusFilter, languageFilter, searchTerm, sortBy, sortOrder, currentPage]);

  // Get status badge class and icon
  const getStatusInfo = (status) => {
    let badgeClass = '';
    let Icon = null;
    
    switch(status) {
      case 'accepted':
        badgeClass = 'bg-green-100 text-green-800';
        Icon = CheckCircle;
        break;
      case 'pending':
      case 'processing':
      case 'judging':
        badgeClass = 'bg-yellow-100 text-yellow-800';
        Icon = Clock;
        break;
      case 'wrong_answer':
        badgeClass = 'bg-red-100 text-red-800';
        Icon = XCircle;
        break;
      case 'compilation_error':
      case 'runtime_error':
      case 'time_limit_exceeded':
      case 'memory_limit_exceeded':
        badgeClass = 'bg-orange-100 text-orange-800';
        Icon = AlertTriangle;
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800';
        Icon = FileText;
    }
    
    return { badgeClass, Icon };
  };

  // Format submission status for display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format language for display
  const formatLanguage = (language) => {
    if (!language) return 'Unknown';
    
    const languageMap = {
      '63': 'JavaScript',
      '71': 'Python',
      '62': 'Java',
      '54': 'C++'
    };
    
    return languageMap[language] || language;
  };

  // Skeleton loader for submissions
  const renderSkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <Card key={index} className="animate-pulse p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="w-full sm:w-2/3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-24 ml-auto sm:ml-0"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
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
            <FileText className="text-blue-600" size={24} />
            <span className="font-bold text-xl">My Submissions</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <Sidebar />
      </div>
    </div>
  );

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
          <div className="relative md:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by problem title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:w-auto md:flex md:gap-4">
            <div className="relative">
              <label htmlFor="status-filter" className="text-xs text-gray-500 mb-1 block">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full appearance-none pr-8"
              >
                <option value="">All Statuses</option>
                <option value="accepted">Accepted</option>
                <option value="wrong_answer">Wrong Answer</option>
                <option value="pending">Pending</option>
                <option value="compilation_error">Compilation Error</option>
                <option value="runtime_error">Runtime Error</option>
              </select>
              <Filter size={16} className="absolute right-3 bottom-2.5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <label htmlFor="language-filter" className="text-xs text-gray-500 mb-1 block">Language</label>
              <select
                id="language-filter"
                value={languageFilter}
                onChange={(e) => {
                  setLanguageFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full appearance-none pr-8"
              >
                <option value="">All Languages</option>
                <option value="63">JavaScript</option>
                <option value="71">Python</option>
                <option value="62">Java</option>
                <option value="54">C++</option>
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
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full appearance-none pr-8"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
              </select>
              <Filter size={16} className="absolute right-3 bottom-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {/* Reset filters button */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={resetFilters}
            variant="secondary"
            className="text-sm"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </Card>
  );

  // Render desktop submissions table
  const renderDesktopSubmissions = () => (
    <div className="overflow-x-auto hidden md:block">
      <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {submissions.map((submission) => {
            const { badgeClass, Icon } = getStatusInfo(submission.status);
            return (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{submission.problem?.title || 'Unknown Problem'}</div>
                  <div className="text-xs text-gray-500">{submission.problem?.difficulty || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatLanguage(submission.language)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full ${badgeClass}`}>
                    {Icon && <Icon size={14} className="mr-1" />}
                    {formatStatus(submission.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.score !== null ? `${submission.score}/100` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(submission.submitted_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => handleViewSubmission(submission.id)}
                    variant="secondary"
                    className="inline-flex items-center text-sm"
                  >
                    View
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Render mobile submission cards
  const renderMobileSubmissions = () => (
    <div className="space-y-4 md:hidden">
      {submissions.map((submission) => {
        const { badgeClass, Icon } = getStatusInfo(submission.status);
        return (
          <Card key={submission.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{submission.problem?.title || 'Unknown Problem'}</h3>
                <p className="text-sm text-gray-500">{submission.problem?.difficulty || ''}</p>
              </div>
              <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full ${badgeClass}`}>
                {Icon && <Icon size={14} className="mr-1" />}
                {formatStatus(submission.status)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-gray-500">Language:</span> {formatLanguage(submission.language)}
              </div>
              <div>
                <span className="text-gray-500">Score:</span> {submission.score !== null ? `${submission.score}/100` : '-'}
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Submitted:</span> {formatDate(submission.submitted_at)}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => handleViewSubmission(submission.id)}
                variant="secondary"
                className="text-sm"
              >
                View Submission
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );

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
              <FileText className="text-blue-600" size={24} />
              <span className="font-bold text-xl">My Submissions</span>
            </div>
            {/* Right side spacer for symmetry */}
            <div className="w-10"></div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            {/* Page header */}
            <Card className="p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Submissions</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    View your submitted solutions to coding problems
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 flex items-center">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-blue-700">{totalSubmissions}</span>
                    <span className="text-sm text-blue-600">Total Submissions</span>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Filters section */}
            {renderFilters()}
            
            {/* Submissions content */}
            {isLoading ? (
              renderSkeletonLoader()
            ) : error ? (
              <Card className="p-6 text-center">
                <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchSubmissions}>Try Again</Button>
              </Card>
            ) : submissions.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-500 mb-6">You haven't made any submissions yet, or none match your current filters.</p>
                <Button onClick={() => navigate('/problems')}>Browse Problems</Button>
              </Card>
            ) : (
              <>
                {renderDesktopSubmissions()}
                {renderMobileSubmissions()}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySubmissionsPage;