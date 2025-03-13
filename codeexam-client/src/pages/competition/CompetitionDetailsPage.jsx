import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import Sidebar from '../../components/Sidebar';

const CompetitionDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token, userRole } = useSelector(state => state.auth); // Changed from userRole to user
  // alert(token)
  const [competition, setCompetition] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    fetchCompetitionData();
  }, [id]);

  // Update the fetch function
  const fetchCompetitionData = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('codeexam_token');
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      const requests = [
        axios.get(`/api/competitions/${id}`, { headers }) // Add headers here
      ];

      if (user?.role === 'admin' || user?.role === 'judge') {
        requests.push(
          axios.get(`/api/competitions/${id}/participants`, { headers }) // And here
        );
      }

      const [competitionRes, participantsRes] = await Promise.all(requests);

      setCompetition(competitionRes.data.data);
      console.log(participantsRes.data.data)
      if (participantsRes) {
        // Match backend response structure
        setParticipants(participantsRes.data.data || []);
        setRegistered((participantsRes.data.data || []).some(p => p.user_id === user?.id));
      }
    } catch (err) {
      console.error('Error fetching competition data:', err);
      // Handle 401 specifically
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
      const token = localStorage.getItem('codeexam_token');

      await axios.post(`/api/competitions/${id}/join`, {}, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      setRegistered(true);
      fetchCompetitionData(); // Refresh participant list
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="ml-64 flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading competition details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="ml-64 flex-1 p-6">
          <Alert type="error" message={error || 'Competition not found'} />
        </div>
      </div>
    );
  }

  const status = getCompetitionStatus();
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    past: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{competition.name}</h1>
              <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
                {status.charAt(0).toUpperCase() + status?.slice(1)}
              </span>
            </div>
            {userRole === 'admin' && (
              <Button
                onClick={() => navigate(`/competition/edit/${competition.id}`)}
                variant="secondary"
              >
                Edit Competition
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-gray-600 mb-6">{competition.description}</p>

                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm">
                        {formatDate(competition.start_time)} - {formatDate(competition.end_time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Registration</p>
                      <p className="text-sm">
                        {competition.registration_required ? 'Registration required' : 'Open participation'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Trophy className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Leaderboard</p>
                      <p className="text-sm">
                        {competition.leaderboard_visible ? 'Public leaderboard' : 'Hidden leaderboard'}
                      </p>
                    </div>
                  </div>
                </div>

                {competition.registration_required && status !== 'past' && !registered && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                      onClick={handleRegister}
                      disabled={registering || status === 'past'}
                      fullWidth
                    >
                      {registering ? 'Registering...' : 'Register for Competition'}
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Participants</h2>
                {participants.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No participants yet</p>
                ) : (
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
                          <span className="ml-3 font-medium text-gray-700">{participant.username}</span>
                        </div>
                        {participant.registered_at && (
                          <span className="text-sm text-gray-500">
                            {new Date(participant.registered_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetailsPage;