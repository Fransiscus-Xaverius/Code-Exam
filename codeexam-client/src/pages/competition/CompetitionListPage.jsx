import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Calendar, Users, Award, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import { SearchBar } from '../../components/SearchBar';
import { Pagination } from '../../components/Pagination';
import { CompetitionFilter } from '../../components/CompetitionFilter';
import { ConfirmationModal } from '../../components/Modal';
import Sidebar from '../../components/Sidebar';

const CompetitionListPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, competition: null });
  
  const navigate = useNavigate();
  
  // Get user data from Redux store
  const { userRole, token } = useSelector(state => state.auth);
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCompetitions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [token, currentPage, searchTerm, filter]);

  const fetchCompetitions = async () => {
    try {
      setIsLoading(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        filter
      });
      
      const response = await axios.get(`/api/competitions?${params}`, { headers });
      setCompetitions(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching competitions:', err);
      setError('Failed to load competitions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (competition) => {
    setDeleteModal({ isOpen: true, competition });
  };
  
  const handleDeleteConfirm = async () => {
    try {
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      await axios.delete(`/api/competitions/${deleteModal.competition.id}`, { headers });
      
      // Update the competitions list
      setCompetitions(competitions.filter(comp => comp.id !== deleteModal.competition.id));
      setDeleteModal({ isOpen: false, competition: null });
    } catch (err) {
      console.error('Error deleting competition:', err);
      setError('Failed to delete competition. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCompetitionStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) {
      return 'upcoming';
    } else if (now > end) {
      return 'past';
    } else {
      return 'ongoing';
    }
  };

  const getStatusBadge = (status) => {
    let color, text;
    
    switch (status) {
      case 'upcoming':
        color = 'bg-blue-100 text-blue-800';
        text = 'Upcoming';
        break;
      case 'ongoing':
        color = 'bg-green-100 text-green-800';
        text = 'Active';
        break;
      case 'past':
        color = 'bg-gray-100 text-gray-800';
        text = 'Ended';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
        text = 'Unknown';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    );
  };

  const renderCompetitions = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading competitions...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert type="error" message={error} className="mb-4">
          <button
            onClick={fetchCompetitions}
            className="mt-3 text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
          >
            Try again
          </button>
        </Alert>
      );
    }

    if (competitions.length === 0) {
      return (
        <Card>
          <div className="p-8 text-center">
            <Award size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitions Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filter !== 'all' 
                ? "Try adjusting your search terms or filters to find what you're looking for."
                : "There are no competitions available at the moment."}
            </p>
            
            {isAdmin && (
              <Button onClick={() => navigate('/competition/new')}>
                Create Your First Competition
              </Button>
            )}
          </div>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map(competition => {
          const status = getCompetitionStatus(competition.start_time, competition.end_time);
          return (
            <Card key={competition.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 flex-1 truncate" title={competition.name}>
                    {competition.name}
                  </h2>
                  {getStatusBadge(status)}
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <div>
                      <div>Start: {formatDate(competition.start_time)}</div>
                      <div>End: {formatDate(competition.end_time)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span>Duration: {Math.round((new Date(competition.end_time) - new Date(competition.start_time)) / (1000 * 60 * 60))} hours</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users size={16} className="mr-2" />
                    <span>{competition.participant_count || 0} participants</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <Button 
                    variant="primary"
                    onClick={() => navigate(`/competitions/${competition.id}`)}
                    className="flex-1 mr-2"
                  >
                    View Details
                  </Button>
                  
                  {isAdmin && (
                    <div className="flex">
                      <button
                        onClick={() => navigate(`/competition/edit/${competition.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Edit Competition"
                      >
                        <Edit size={18} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(competition)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Delete Competition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const handleRetry = () => {
    setError(null);
    fetchCompetitions();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6 ml-64">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Competitions</h1>
            
            {isAdmin && (
              <Button 
                onClick={() => navigate('/competition/new')}
                className="flex items-center justify-center"
              >
                <Plus size={16} className="mr-2" />
                Create Competition
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search competitions by name or description..."
                />
              </div>
              <CompetitionFilter
                currentFilter={filter}
                onFilterChange={setFilter}
              />
            </div>
          </div>
          
          {renderCompetitions()}
          
          {!isLoading && !error && competitions.length > 0 && totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, competition: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Competition"
        message={`Are you sure you want to delete "${deleteModal.competition?.name}"? This action cannot be undone.`}
        confirmText="Delete Competition"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CompetitionListPage;