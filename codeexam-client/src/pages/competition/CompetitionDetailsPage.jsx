import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Calendar, 
  Users, 
  Trophy, 
  Clock, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  ChevronRight, 
  UserPlus,
  ExternalLink, 
  Award,
  BarChart2
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import Sidebar from '../../components/Sidebar';
import API from '../../components/helpers/API';

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
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchCompetitionData();
  }, [id]);

  const isCompetitionActive = () => {
    if (!competition) return false;
    
    const now = new Date().getTime();
    const startTime = new Date(competition.start_time).getTime();
    const endTime = new Date(competition.end_time).getTime();
    
    return now >= startTime && now <= endTime;
  };

  const handleEnterCompetition = () => {
    navigate(`/competitions/${id}/workspace`);
  };

  const fetchCompetitionData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      const requests = [
        API.get(`/api/competitions/${id}`, { headers })
      ];

      if (user?.role === 'admin' || user?.role === 'judge') {
        requests.push(
          API.get(`/api/competitions/${id}/participants`, { headers })
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
      await API.post(`/api/competitions/${id}/join`, {}, {
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
      await API.delete(`/api/competitions/${id}`, {
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

  const getRemainingTime = () => {
    if (!competition) return null;
    
    const now = new Date();
    const end = new Date(competition.end_time);
    
    if (now > end) return null;
    
    const diffMs = end - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHrs}h remaining`;
    } else if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m remaining`;
    } else {
      return `${diffMins}m remaining`;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center p-6">
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
  
  const statusLabels = {
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    past: 'Completed'
  };

  const remainingTime = getRemainingTime();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                      <li>
                        <button 
                          onClick={() => navigate('/competitions')}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          Competitions
                        </button>
                      </li>
                      <li>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </li>
                      <li>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {competition.name}
                        </span>
                      </li>
                    </ol>
                  </nav>
                  
                  <div className="mt-2 flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl sm:truncate">
                      {competition.name}
                    </h1>
                    <span 
                      className={`ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]} border shadow-sm`}
                    >
                      {statusLabels[status]}
                    </span>
                  </div>
                  
                  {remainingTime && status !== 'past' && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {remainingTime}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                  {userRole === 'admin' && (
                    <>
                      <Button
                        onClick={() => navigate(`/competition/edit/${competition.id}`)}
                        variant="secondary"
                        className="flex items-center"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="danger"
                        className="flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                  
                  {isCompetitionActive() && registered && (
                    <Button 
                      onClick={handleEnterCompetition}
                      variant="primary"
                      className="flex items-center"
                    >
                      <Trophy size={18} className="mr-2" />
                      Enter Competition
                    </Button>
                  )}
                  
                  {!registered && competition?.registration_required && status === 'upcoming' && (
                    <Button
                      onClick={handleRegister}
                      disabled={registering || !user}
                      variant="success"
                      className="flex items-center"
                    >
                      <UserPlus size={18} className="mr-2" />
                      {registering ? 'Registering...' : 'Register'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Details
                </button>
                
                {(user?.role === 'admin' || user?.role === 'judge') && (
                  <button
                    onClick={() => setActiveTab('participants')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'participants'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Participants
                  </button>
                )}
                
                {competition.leaderboard_visible && (
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'leaderboard'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Leaderboard
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Competition Description */}
                  <Card>
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Description</h2>
                    </div>
                    <div className="p-6">
                      <div className="prose max-w-none">
                        <p className="text-gray-600">{competition.description || 'No description provided.'}</p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Competition Rules or Guidelines */}
                  <Card>
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Rules & Guidelines</h2>
                    </div>
                    <div className="p-6">
                      <div className="prose max-w-none">
                        <p className="text-gray-600">
                          {competition.rules || 'No specific rules provided for this competition.'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Registration Call to Action */}
                  {!registered && competition.registration_required && status === 'upcoming' && (
                    <Card className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-blue-200">
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                            <UserPlus className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-blue-900">Ready to participate?</h3>
                            <p className="mt-2 text-blue-700">
                              Registration is required for this competition. Sign up now to secure your spot!
                            </p>
                            <div className="mt-4">
                              <Button
                                onClick={handleRegister}
                                disabled={registering || !user}
                                variant="primary"
                                className="w-full sm:w-auto"
                              >
                                {registering ? 'Processing...' : 'Register Now'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
                
                <div className="space-y-6">
                  {/* Competition Info Card */}
                  <Card>
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Competition Details</h2>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-3 text-gray-500" /> 
                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="font-medium">{formatDate(competition.start_time)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">End Date</p>
                          <p className="font-medium">{formatDate(competition.end_time)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Participants</p>
                          <p className="font-medium">{participants.length || 0} registered</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Award className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Registration</p>
                          <p className="font-medium">{competition.registration_required ? 'Required' : 'Open'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <BarChart2 className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Leaderboard</p>
                          <p className="font-medium">{competition.leaderboard_visible ? 'Public' : 'Private'}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Status Card */}
                  <Card>
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Your Status</h2>
                    </div>
                    <div className="p-6">
                      {registered ? (
                        <div className="flex flex-col items-center text-center p-4">
                          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <Users className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">You're registered!</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            You're all set to participate in this competition.
                          </p>
                          
                          {isCompetitionActive() && (
                            <Button
                              onClick={handleEnterCompetition}
                              variant="primary"
                              className="mt-4 w-full flex items-center justify-center"
                            >
                              <ExternalLink size={16} className="mr-2" />
                              Enter Competition Workspace
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center p-4">
                          <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                            <UserPlus className="h-8 w-8 text-yellow-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">Not Registered</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Registration is required to participate in this competition.
                          </p>
                          
                          {status === 'upcoming' && (
                            <Button
                              onClick={handleRegister}
                              disabled={registering || !user}
                              variant="success"
                              className="mt-4 w-full"
                            >
                              {registering ? 'Processing...' : 'Register Now'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
            
            {activeTab === 'participants' && (user?.role === 'admin' || user?.role === 'judge') && (
              <Card>
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Participants</h2>
                </div>
                <div className="p-6">
                  {participants.length > 0 ? (
                    <div className="overflow-hidden shadow-sm border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Registration Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {participants.map((participant) => (
                            <tr key={participant.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-900">
                                      {participant.user.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{participant.user.username}</div>
                                    <div className="text-sm text-gray-500">{participant.user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {participant.registered_at ? new Date(participant.registered_at).toLocaleDateString() : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No participants</h3>
                      <p className="mt-1 text-sm text-gray-500">No one has registered for this competition yet.</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            {activeTab === 'leaderboard' && competition.leaderboard_visible && (
              <Card>
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Leaderboard</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Leaderboard Coming Soon</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      The leaderboard will be available once the competition begins.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Delete Competition</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Are you sure you want to delete this competition? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="danger"
                  className="flex items-center"
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
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionDetailsPage;