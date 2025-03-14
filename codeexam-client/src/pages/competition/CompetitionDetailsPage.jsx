import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Calendar, Users, Trophy, Clock, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import Sidebar from '../../components/Sidebar';

const CompetitionDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token, userRole } = useSelector(state => state.auth);
  const [competition, setCompetition] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCompetitionData();
  }, [id]);

  const fetchCompetitionData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      const requests = [
        axios.get(`/api/competitions/${id}`, { headers })
      ];

      if (user?.role === 'admin' || user?.role === 'judge') {
        requests.push(
          axios.get(`/api/competitions/${id}/participants`, { headers })
        );
      }

      const [competitionRes, participantsRes] = await Promise.all(requests);

      setCompetition(competitionRes.data.data);
      if (participantsRes) {
        setParticipants(participantsRes.data.data || []);
        setRegistered((participantsRes.data.data || []).some(p => p.user_id === user?.id));
      }
    } catch (err) {
      console.error('Error fetching competition data:', err);
      if (err.response?.status === 401) {
        setError('Please login to view this content');
      } else {
        setError('Failed to load competition data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await axios.post(`/api/competitions/${id}/join`, {}, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      setRegistered(true);
      fetchCompetitionData();
    } catch (err) {
      setError('Failed to register for competition. Please try again.');
      console.error('Error registering:', err);
    } finally {
      setRegistering(false);
    }
  };

  const getCompetitionStatus = () => {
    if (!competition) return '';

    const now = new Date();
    const start = new Date(competition.start_time);
    const end = new Date(competition.end_time);

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

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/api/competitions/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      navigate('/competitions');
    } catch (err) {
      console.error('Error deleting competition:', err);
      setError('Failed to delete competition. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading competition details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <Alert type="error" message={error || 'Competition not found'} />
            <Button
              onClick={() => navigate('/competitions')}
              variant="secondary"
              className="mt-4"
            >
              Back to Competitions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const status = getCompetitionStatus();
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    ongoing: 'bg-green-100 text-green-800 border-green-200',
    past: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{competition.name}</h1>
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]} border shadow-sm`}
                role="status"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            {userRole === 'admin' && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/competition/edit/${competition.id}`)}
                  className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Competition
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Competition
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">{competition.description}</p>
                  
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Competition Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">
                          Start: {formatDate(competition.start_time)}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">
                          End: {formatDate(competition.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {!registered && competition.registration_required && status === 'upcoming' && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Registration Required</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          You need to register to participate in this competition.
                        </p>
                        <div className="mt-4">
                          <Button
                            onClick={handleRegister}
                            disabled={registering || !user}
                            className="w-full sm:w-auto"
                          >
                            {registering ? 'Registering...' : 'Register Now'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {(user?.role === 'admin' || user?.role === 'judge') && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Participants</h2>
                    {participants.length > 0 ? (
                      <div className="space-y-3">
                        {participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {participant.user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="ml-3 font-medium text-gray-700">{participant.user.username}</span>
                            </div>
                            {participant.registered_at && (
                              <span className="text-sm text-gray-500">
                                {new Date(participant.registered_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No participants yet</p>
                    )}
                  </div>
                </Card>
              )}

              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Competition Status</h2>
                  <div className="space-y-4">
                    {competition.registration_required && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Registration</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${registered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {registered ? 'Registered' : 'Not Registered'}
                        </span>
                      </div>
                    )}
                    {competition.leaderboard_visible && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Leaderboard</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Public
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Competition</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this competition? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionDetailsPage;