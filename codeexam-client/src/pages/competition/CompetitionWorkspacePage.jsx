import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Clock, List, ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, AlertTriangle 
} from 'lucide-react';
import API from '../../components/helpers/API';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import Sidebar from '../../components/Sidebar';
import CompetitionTimer from '../../components/dashboard/CompetitionTimer';

const CompetitionWorkspacePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useSelector(state => state.auth);
  
  const [competition, setCompetition] = useState(null);
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [problemStatuses, setProblemStatuses] = useState({});
  
  // Check if user is registered and competition is active
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: token ? `Bearer ${token}` : '' };
        
        // Get competition details
        const competitionRes = await API.get(`/api/competitions/${id}`, { headers });
        const competitionData = competitionRes.data.data;
        setCompetition(competitionData);
        
        // Check if competition is active
        const now = new Date().getTime();
        const startTime = new Date(competitionData.start_time).getTime();
        const endTime = new Date(competitionData.end_time).getTime();
        
        if (now < startTime || now > endTime) {
          setError('This competition is not currently active');
          return;
        }
        
        // Check if user is registered
        const registrationRes = await API.get(`/api/competitions/${id}/registration`, { headers });
        console.log({registrationRes:registrationRes.data})
        if (!registrationRes.data.isRegistered) {
          setError('You are not registered for this competition');
          return;
        }
        
        // Get competition problems
        const problemsRes = await API.get(`/api/competitions/${id}/problems`, { headers });
        if (problemsRes.data.success) {
          const problemsData = problemsRes.data.data || [];
          setProblems(problemsData.sort((a, b) => a.order_index - b.order_index));
          
          // Get user's submission status for each problem
          const submissionStatusRes = await API.get(`/api/competitions/${id}/submission-status`, { headers });
          if (submissionStatusRes.data.success) {
            setProblemStatuses(submissionStatusRes.data.data || {});
          }
        }
      } catch (err) {
        console.error('Error checking eligibility:', err);
        setError('Failed to load competition data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    checkEligibility();
  }, [id, token, user?.id]);
  
  // Navigate to problem solving page
  const handleSolveProblem = (problemId) => {
    navigate(`/competitions/${id}/problems/${problemId}/solve`);
  };
  
  // Navigate between problems
  const goToPreviousProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    }
  };
  
  const goToNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    }
  };
  
  // Get problem status icon
  const getProblemStatusIcon = (problemId) => {
    const status = problemStatuses[problemId];
    if (!status) return null;
    
    if (status === 'solved') {
      return <CheckCircle size={16} className="text-green-500" />;
    } else if (status === 'attempted') {
      return <AlertTriangle size={16} className="text-yellow-500" />;
    }
    return null;
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 ml-64">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 ml-64">
          <Alert type="error" message={error} />
          <div className="mt-4">
            <Button onClick={() => navigate(`/competitions/${id}`)}>
              Back to Competition Details
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const currentProblem = problems[currentProblemIndex] || null;
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Competition Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{competition?.name}</h1>
            <p className="text-gray-600">Solve problems to earn points and climb the leaderboard</p>
          </div>
          <div className="flex items-center">
            <Clock size={20} className="mr-2 text-blue-600" />
            {competition && <CompetitionTimer competition={competition} />}
          </div>
        </div>
        
        {/* Problem Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Problems</h2>
            <Button 
              onClick={() => navigate(`/competitions/${id}/leaderboard`)}
              variant="secondary"
              size="sm"
            >
              View Leaderboard
            </Button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {problems.map((problem, index) => (
              <button
                key={problem.id || problem.problem_id}
                onClick={() => setCurrentProblemIndex(index)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  index === currentProblemIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
                {getProblemStatusIcon(problem.id || problem.problem_id)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Current Problem */}
        {currentProblem && (
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{currentProblem.title || currentProblem.Problem?.title}</h2>
                <div className="flex items-center mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    (currentProblem.difficulty || currentProblem.Problem?.difficulty) === 'Easy'
                      ? 'bg-green-100 text-green-800'
                      : (currentProblem.difficulty || currentProblem.Problem?.difficulty) === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentProblem.difficulty || currentProblem.Problem?.difficulty}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {currentProblem.points || currentProblem.Problem?.points} points
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={goToPreviousProblem}
                  disabled={currentProblemIndex === 0}
                  variant="secondary"
                  size="sm"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <Button
                  onClick={goToNextProblem}
                  disabled={currentProblemIndex === problems.length - 1}
                  variant="secondary"
                  size="sm"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
            
            <div className="prose max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ 
                __html: currentProblem.description || currentProblem.Problem?.description 
              }} />
            </div>
            
            <div className="mt-6">
              <Button
                onClick={() => handleSolveProblem(currentProblem.id || currentProblem.problem_id)}
                className="w-full sm:w-auto"
              >
                Solve This Problem
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompetitionWorkspacePage;