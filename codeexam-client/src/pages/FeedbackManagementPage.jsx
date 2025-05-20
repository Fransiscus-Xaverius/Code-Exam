import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  MessageSquare, 
  Filter, 
  Search, 
  ChevronDown, 
  AlertTriangle, 
  Check, 
  Eye, 
  Clock, 
  Trash2,
  BarChart2,
  Star,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { Pagination } from '../components/Pagination';
import API from '../components/helpers/API';
import FeedbackStats from '../components/FeedbackStats';
import FeedbackDetailModal from '../components/FeedbackDetailModal';
import FeedbackFilterPanel from '../components/FeedbackFilterPanel';

const FeedbackManagementPage = () => {
  // Navigation
  const navigate = useNavigate();
  
  // Auth state from Redux
  const { userRole, token } = useSelector(state => state.auth);
  
  // Check if user is admin, redirect if not
  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);
  
  // State
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [statsVisible, setStatsVisible] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    rating: '',
    startDate: '',
    endDate: ''
  });
  
  // Settings
  const itemsPerPage = 10;
  
  // Toggle mobile sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Toggle filter visibility on mobile
  const toggleFilters = () => setFiltersVisible(!filtersVisible);
  
  // Load feedback data
  useEffect(() => {
    if (token) {
      fetchFeedbacks();
      fetchStats();
    }
  }, [token, currentPage, filters]);
  
  // Fetch feedback stats
  const fetchStats = async () => {
    try {
      const response = await API.get('/api/feedbacks/stats', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      if (response.data.success) {
        setStats(response.data.data);
        setError(null);
      } else {
        console.error('Failed to fetch feedback stats:', response.data);
      }
    } catch (err) {
      console.error('Error fetching feedback stats:', err);
    }
  };
  
  // Fetch feedbacks with current filters and pagination
  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      
      // Build query params
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });
      
      // Add active filters
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      // Make API request
      const response = await API.get(`/api/feedbacks?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      if (response.data.success) {
        setFeedbacks(response.data.data);
        setTotalCount(response.data.count);
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load feedbacks');
        setFeedbacks([]);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to load feedbacks. Please try again later.');
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // View feedback details
  const handleViewFeedback = async (feedbackId) => {
    try {
      const response = await API.get(`/api/feedbacks/${feedbackId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      if (response.data.success) {
        setSelectedFeedback(response.data.data);
        setDetailModalOpen(true);
        
        // If feedback is unread, update it to read
        if (response.data.data.status === 'unread') {
          updateFeedbackStatus(feedbackId, 'read');
        }
      } else {
        setError('Failed to load feedback details');
      }
    } catch (err) {
      console.error('Error fetching feedback details:', err);
      setError('Failed to load feedback details');
    }
  };
  
  // Update feedback status
  const updateFeedbackStatus = async (feedbackId, status) => {
    try {
      const response = await API.put(
        `/api/feedbacks/${feedbackId}/status`,
        { status },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      
      if (response.data.success) {
        // Update in local state
        setFeedbacks(prev => 
          prev.map(feedback => 
            feedback.id === feedbackId 
              ? { ...feedback, status } 
              : feedback
          )
        );
        
        // Also update selected feedback if open
        if (selectedFeedback && selectedFeedback.id === feedbackId) {
          setSelectedFeedback(prev => ({ ...prev, status }));
        }
        
        // Refresh stats
        fetchStats();
      }
    } catch (err) {
      console.error('Error updating feedback status:', err);
      setError('Failed to update feedback status');
    }
  };
  
  // Handle delete feedback
  const handleDeleteClick = (feedbackId) => {
    setDeleteId(feedbackId);
    setDeleteModalOpen(true);
  };
  
  // Confirm delete feedback
  const confirmDeleteFeedback = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      
      const response = await API.delete(`/api/feedbacks/${deleteId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      if (response.data.success) {
        // Remove from local state
        setFeedbacks(prev => prev.filter(feedback => feedback.id !== deleteId));
        
        // Close modal
        setDeleteModalOpen(false);
        setDeleteId(null);
        
        // Refresh stats
        fetchStats();
        
        // If we deleted the last item on this page and it's not the first page,
        // go to the previous page
        if (feedbacks.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          // Otherwise just refresh the current page
          fetchFeedbacks();
        }
      } else {
        setError('Failed to delete feedback');
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
      setError('Failed to delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      rating: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Render stars for rating
  const renderRatingStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };
  
  // Get status badge
  const renderStatusBadge = (status) => {
    const statusConfig = {
      unread: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock size={14} className="mr-1" />
      },
      read: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Eye size={14} className="mr-1" />
      },
      addressed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <Check size={14} className="mr-1" />
      }
    };
    
    const config = statusConfig[status] || statusConfig.unread;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    View and manage user feedback submissions
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Button 
                    onClick={() => setStatsVisible(!statsVisible)}
                    variant="secondary"
                    className="flex items-center"
                  >
                    <BarChart2 size={16} className="mr-2" />
                    {statsVisible ? 'Hide Stats' : 'Show Stats'}
                  </Button>
                </div>
              </div>
            </header>
            
            {/* Stats Cards */}
            {statsVisible && stats && (
              <FeedbackStats stats={stats} />
            )}
            
            {/* Filter Panel */}
            <FeedbackFilterPanel 
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
              filtersVisible={filtersVisible}
              toggleFilters={toggleFilters}
            />
            
            {/* Error Alert */}
            {error && (
              <Alert type="error" message={error} className="mb-6" />
            )}
            
            {/* Feedback List */}
            <Card className="overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Feedback Submissions
                  </h2>
                  <span className="text-sm text-gray-500">
                    {totalCount} total feedbacks
                  </span>
                </div>
              </div>
              
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No feedbacks found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No feedback submissions match your current filters.
                  </p>
                  {Object.values(filters).some(v => v !== '') && (
                    <button
                      onClick={resetFilters}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Reset all filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Mobile List View */}
                  <div className="md:hidden">
                    <div className="divide-y divide-gray-200">
                      {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between">
                            <div className="mb-2 flex items-center">
                              {renderStatusBadge(feedback.status)}
                              <span className="ml-2 font-medium text-xs text-gray-500">
                                {feedback.category}
                              </span>
                            </div>
                            {renderRatingStars(feedback.rating)}
                          </div>
                          <p className="text-sm text-gray-800 line-clamp-2 mb-2">
                            {feedback.content}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {feedback.user ? feedback.user.username : 'Anonymous'} • {formatDate(feedback.created_at)}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewFeedback(feedback.id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(feedback.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Content
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            From
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {feedbacks.map((feedback) => (
                          <tr 
                            key={feedback.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewFeedback(feedback.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              {renderStatusBadge(feedback.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {feedback.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900 truncate max-w-xs">
                                {feedback.content}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {renderRatingStars(feedback.rating)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {feedback.is_anonymous ? 'Anonymous' : feedback.user?.username || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">
                                {formatDate(feedback.created_at)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewFeedback(feedback.id);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(feedback.id);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
      
      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          onUpdateStatus={(status) => updateFeedbackStatus(selectedFeedback.id, status)}
          onDelete={() => {
            setDetailModalOpen(false);
            handleDeleteClick(selectedFeedback.id);
          }}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-4">
                Delete Feedback
              </h3>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Are you sure you want to delete this feedback? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => setDeleteModalOpen(false)}
                  variant="secondary"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteFeedback}
                  variant="danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagementPage;