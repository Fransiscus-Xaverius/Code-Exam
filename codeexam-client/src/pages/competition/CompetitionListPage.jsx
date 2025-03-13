import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Plus, Search, Filter, Calendar, Users } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import Sidebar from '../../components/Sidebar';

const CompetitionListPage = () => {
  const navigate = useNavigate();
  const { userRole } = useSelector(state => state.auth);
  
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, past

  useEffect(() => {
    fetchCompetitions();
  }, [currentPage, searchTerm, filter]);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('codeexam_token');
      const response = await axios.get(`/api/competitions?page=${currentPage}&search=${searchTerm}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      setCompetitions(response.data.data);
      setTotalPages(Math.ceil(response.data.count / 10));
    } catch (err) {
      setError('Failed to load competitions. Please try again.');
      console.error('Error fetching competitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCompetitionStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'ongoing';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterCompetitions = (competitions) => {
    if (filter === 'all') return competitions;
    
    return competitions.filter(comp => {
      const status = getCompetitionStatus(comp.start_time, comp.end_time);
      return status === filter;
    });
  };

  const displayedCompetitions = filterCompetitions(competitions);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Competitions</h1>
          {userRole === 'admin' && (
            <Button
              onClick={() => navigate('/competition/new')}
              className="flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Competition
            </Button>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <InputField
              type="text"
              placeholder="Search competitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'primary' : 'secondary'}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === 'ongoing' ? 'primary' : 'secondary'}
              onClick={() => setFilter('ongoing')}
            >
              Ongoing
            </Button>
            <Button
              variant={filter === 'past' ? 'primary' : 'secondary'}
              onClick={() => setFilter('past')}
            >
              Past
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading competitions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : displayedCompetitions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No competitions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCompetitions.map((competition) => {
              const status = getCompetitionStatus(competition.start_time, competition.end_time);
              const statusColors = {
                upcoming: 'bg-blue-100 text-blue-800',
                ongoing: 'bg-green-100 text-green-800',
                past: 'bg-gray-100 text-gray-800'
              };

              return (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        {competition.name}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{competition.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {formatDate(competition.start_time)} - {formatDate(competition.end_time)}
                        </span>
                      </div>
                      
                      {competition.registration_required && (
                        <div className="flex items-center text-gray-500">
                          <Users className="h-4 w-4 mr-2" />
                          <span className="text-sm">Registration required</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => navigate(`/competitions/${competition.id}`)}
                        fullWidth
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2 bg-white rounded-md shadow">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionListPage;