import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { CompetitionCard } from '../../components/CompetitionCard';
import { CompetitionFilter } from '../../components/CompetitionFilter';
import { SearchBar } from '../../components/SearchBar';
import { Pagination } from '../../components/Pagination';
import { Button } from '../../components/Button';
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
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCompetitions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, filter]);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        filter
      });
      
      const response = await axios.get(`/api/competitions?${params}`);
      setCompetitions(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to load competitions. Please try again later.');
      console.error('Error fetching competitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCompetitionStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    return now < startDate ? 'upcoming' : now > endDate ? 'past' : 'ongoing';
  };

  const renderContent = () => {
    if (loading) {
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
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-8 bg-red-50 rounded-lg border border-red-100">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button
            onClick={fetchCompetitions}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    if (competitions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No competitions found</h3>
          <p className="text-gray-500 max-w-sm">Try adjusting your search terms or filters to find what you're looking for.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((competition) => (
          <CompetitionCard
            key={competition.id}
            competition={competition}
            status={getCompetitionStatus(competition.start_time, competition.end_time)}
            onViewDetails={() => navigate(`/competitions/${competition.id}`)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Competitions</h1>
            {userRole === 'admin' && (
              <Button
                onClick={() => navigate('/competition/new')}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-5 w-5 mr-2" />
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

          {renderContent()}

          {!loading && !error && totalPages > 1 && (
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
    </div>
  );
};

export default CompetitionListPage;