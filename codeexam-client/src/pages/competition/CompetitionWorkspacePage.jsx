import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Clock, List, ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, AlertTriangle, Trophy,
  Users, Code, Medal, Award, Zap, ArrowRight,
  BookOpen, MessageSquare, Monitor, FileCode
} from 'lucide-react';
import API from '../../components/helpers/API';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import Sidebar from '../../components/Sidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/Tabs';

const CompetitionWorkspacePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useSelector(state => state.auth);
  
  // State for workspace data
  const [workspaceData, setWorkspaceData] = useState(null);
  const [problems, setProblems] = useState([]);
  const [competition, setCompetition] = useState(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userProgress, setUserProgress] = useState({
    points: 0,
    totalPoints: 0,
    problemsSolved: 0,
    totalProblems: 0
  });
  
  // State for leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('problems');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [problemListView, setProblemListView] = useState('grid'); // 'grid' or 'list'
  
  // Format time for display
  const formatTimeRemaining = (endTime) => {
    if (!endTime) return '';
    
    const now = new Date();
    const end = new Date(endTime);
    const diffMs = end - now;
    
    if (diffMs <= 0) return 'Competition ended';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
  };
  
  // Get workspace data
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: token ? `Bearer ${token}` : '' };
        
        // Get workspace data
        const response = await API.get(`/api/competitions/${id}/workspace`, { headers });
        
        if (response.data.success) {
          const data = response.data.data;
          setWorkspaceData(data);
          setCompetition(data.competition);
          setProblems(data.problems || []);
          setUserProgress(data.userProgress || {
            points: 0,
            totalPoints: 0,
            problemsSolved: 0,
            totalProblems: (data.problems || []).length
          });
          
          // Set error to null as we've successfully loaded the data
          setError(null);
        } else {
          setError(response.data.message || 'Failed to load competition workspace');
        }
      } catch (err) {
        console.error('Error fetching competition workspace:', err);
        setError(err.response?.data?.message || 'Failed to load competition data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkspaceData();
    
    // Set up interval to refresh data every 60 seconds
    const intervalId = setInterval(() => {
      fetchWorkspaceData();
    }, 60000);
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, [id, token]);
  
  // Get leaderboard data when activeTab is 'leaderboard'
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab, id, token]);
  
  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      
      const response = await API.get(`/api/competitions/${id}/leaderboard`, { headers });
      
      if (response.data.success) {
        const leaderboardData = response.data.data || [];
        setLeaderboard(leaderboardData);
        
        // Find current user in leaderboard
        const userEntry = leaderboardData.find(entry => entry.isCurrentUser);
        setUserRank(userEntry ? userEntry.rank : null);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      // We don't set an error state here as this is not critical
    } finally {
      setLeaderboardLoading(false);
    }
  };
  
  // Navigate to problem solving page
  const handleSolveProblem = (problem) => {
    if (!problem) return;
    
    // Navigate based on problem type
    if (problem.problem_type === 'frontend') {
      navigate(`/solve-fe/${problem.problem_id}?competition=${id}`);
    } else {
      navigate(`/solve/${problem.problem_id}?competition=${id}`);
    }
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
  
  // Get problem status icon and class
  const getProblemStatusInfo = (problem) => {
    if (!problem) return { icon: null, className: '' };
    
    const status = problem.status;
    
    if (status === 'solved') {
      return { 
        icon: <CheckCircle size={16} className="text-green-500" />, 
        className: 'border-green-500 bg-green-50' 
      };
    } else if (status === 'attempted') {
      return { 
        icon: <AlertTriangle size={16} className="text-yellow-500" />, 
        className: 'border-yellow-500 bg-yellow-50' 
      };
    }
    
    return { icon: null, className: '' };
  };
  
  // Get problem type icon
  const getProblemTypeIcon = (problemType) => {
    if (problemType === 'frontend') {
      return <Monitor size={16} className="text-purple-500" />;
    }
    return <FileCode size={16} className="text-blue-500" />;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!userProgress.totalPoints) return 0;
    return Math.round((userProgress.points / userProgress.totalPoints) * 100);
  };
  
  const progressPercentage = calculateProgress();
  
  // Loading state
  if (loading && !competition) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 md:ml-64">
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-6 text-lg text-gray-600 font-medium">Loading competition workspace...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 md:ml-64">
          <Card className="p-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle size={48} className="text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Cannot Access Competition</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate(`/competitions/${id}`)}>
                  Back to Competition Details
                </Button>
                <Button variant="secondary" onClick={() => navigate('/competitions')}>
                  Browse All Competitions
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  const currentProblem = problems[currentProblemIndex] || null;
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        {/* Competition Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <Trophy size={20} className="text-blue-600 mr-2" />
                  <h1 className="text-xl font-bold text-gray-800">{competition?.name}</h1>
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Solve problems to earn points and climb the leaderboard</p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Time Remaining</div>
                  <div className="flex items-center">
                    <Clock size={16} className="text-blue-600 mr-2" />
                    <span className="text-lg font-mono font-bold text-blue-800">
                      {formatTimeRemaining(competition?.end_time)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Score</div>
                  <div className="flex items-center">
                    <Award size={16} className="text-blue-600 mr-2" />
                    <span className="text-lg font-mono font-bold text-blue-800">
                      {userProgress.points} / {userProgress.totalPoints}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-b-0">
                <TabsTrigger value="problems" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4">
                  <Code size={16} className="mr-2" />
                  Problems
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4">
                  <Trophy size={16} className="mr-2" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="instructions" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4">
                  <BookOpen size={16} className="mr-2" />
                  Instructions
                </TabsTrigger>
                {competition?.discussion_enabled && (
                  <TabsTrigger value="discussion" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4">
                    <MessageSquare size={16} className="mr-2" />
                    Discussion
                  </TabsTrigger>
                )}
              </TabsList>
              
              {/* Problems Tab Content */}
              <TabsContent value="problems" className="mt-0 p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Problems List (Left Side) */}
                  <div className="lg:col-span-1">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Problems</h2>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setProblemListView('grid')}
                            className={`p-1.5 rounded ${problemListView === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                            title="Grid view"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a.5.5 0 0 1-.5.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                            </svg>
                          </button>
                          <button 
                            onClick={() => setProblemListView('list')}
                            className={`p-1.5 rounded ${problemListView === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                            title="List view"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* User Progress */}
                      <div className="mb-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-blue-700">Your Progress</span>
                          <span className="text-sm font-semibold text-blue-800">{progressPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-sm">
                          <div className="flex items-center">
                            <CheckCircle size={16} className="text-green-600 mr-1.5" />
                            <span>{userProgress.problemsSolved} solved</span>
                          </div>
                          <div className="flex items-center">
                            <Award size={16} className="text-blue-600 mr-1.5" />
                            <span>{userProgress.points} points</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Problems List */}
                      {problemListView === 'grid' ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-4">
                          {problems.map((problem, index) => {
                            const { icon, className } = getProblemStatusInfo(problem);
                            return (
                              <button
                                key={problem.id || problem.problem_id}
                                onClick={() => setCurrentProblemIndex(index)}
                                className={`flex flex-col items-center p-2 rounded-lg border ${
                                  index === currentProblemIndex
                                    ? 'ring-2 ring-blue-600 border-blue-400'
                                    : `border-gray-200 hover:border-blue-300 hover:bg-blue-50 ${className}`
                                }`}
                              >
                                <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-medium mb-2">
                                  {index + 1}
                                </div>
                                <div className="flex items-center justify-center mb-1">
                                  {icon}
                                </div>
                                <div className="mt-1 text-xs">{problem.points} pts</div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-2 mb-4">
                          {problems.map((problem, index) => {
                            const { icon, className } = getProblemStatusInfo(problem);
                            return (
                              <button
                                key={problem.id || problem.problem_id}
                                onClick={() => setCurrentProblemIndex(index)}
                                className={`flex items-center justify-between w-full p-3 rounded-lg border text-left ${
                                  index === currentProblemIndex
                                    ? 'ring-2 ring-blue-600 border-blue-400'
                                    : `border-gray-200 hover:border-blue-300 hover:bg-blue-50 ${className}`
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-medium mr-3">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm truncate max-w-[200px]">{problem.title}</div>
                                    <div className="flex items-center text-xs text-gray-500">
                                      {getProblemTypeIcon(problem.problem_type)}
                                      <span className="ml-1.5">{problem.difficulty} · {problem.points} pts</span>
                                    </div>
                                  </div>
                                </div>
                                <div>{icon}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      
                      {userRank && (
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Your Rank</span>
                            <span className="flex items-center font-semibold">
                              <Medal size={16} className="text-yellow-500 mr-1.5" />
                              {userRank} / {leaderboard.length}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                  
                  {/* Current Problem (Right Side) */}
                  <div className="lg:col-span-2">
                    {currentProblem ? (
                      <Card className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h2 className="text-xl font-bold">{currentProblem.title}</h2>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                currentProblem.difficulty === 'Easy'
                                  ? 'bg-green-100 text-green-800'
                                  : currentProblem.difficulty === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {currentProblem.difficulty}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">
                                {currentProblem.points} points
                              </span>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="flex items-center text-sm text-gray-500">
                                {getProblemTypeIcon(currentProblem.problem_type)}
                                <span className="ml-1">
                                  {currentProblem.problem_type === 'frontend' ? 'Frontend' : 'Coding'} Challenge
                                </span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={goToPreviousProblem}
                              disabled={currentProblemIndex === 0}
                              variant="outline"
                              size="sm"
                              className="hidden md:flex"
                            >
                              <ChevronLeft size={16} className="mr-1" />
                              Previous
                            </Button>
                            <Button
                              onClick={goToNextProblem}
                              disabled={currentProblemIndex === problems.length - 1}
                              variant="outline"
                              size="sm"
                              className="hidden md:flex"
                            >
                              Next
                              <ChevronRight size={16} className="ml-1" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Problem Status Badge */}
                        {currentProblem.status && (
                          <div className={`mb-6 p-3 rounded-lg ${
                            currentProblem.status === 'solved' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-yellow-50 border border-yellow-200'
                          }`}>
                            <div className="flex items-center">
                              {currentProblem.status === 'solved' ? (
                                <>
                                  <CheckCircle size={20} className="text-green-600 mr-2" />
                                  <div>
                                    <p className="font-medium text-green-800">
                                      You've solved this problem
                                    </p>
                                    <p className="text-sm text-green-700">
                                      You earned {currentProblem.points} points for this problem.
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle size={20} className="text-yellow-600 mr-2" />
                                  <div>
                                    <p className="font-medium text-yellow-800">
                                      You've attempted this problem
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                      Your previous attempt was not successful. Try again!
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="prose max-w-none mb-6">
                          <p>{currentProblem.description}</p>
                        </div>
                        
                        <div className="mt-8">
                          <Button
                            onClick={() => handleSolveProblem(currentProblem)}
                            className="w-full sm:w-auto flex items-center justify-center"
                            size="lg"
                          >
                            Solve This Problem
                            <ArrowRight size={18} className="ml-2" />
                          </Button>
                        </div>
                        
                        {/* Mobile Navigation Buttons */}
                        <div className="md:hidden flex justify-between mt-8">
                          <Button
                            onClick={goToPreviousProblem}
                            disabled={currentProblemIndex === 0}
                            variant="outline"
                            className="flex-1 mr-2"
                          >
                            <ChevronLeft size={16} className="mr-1" />
                            Previous
                          </Button>
                          <Button
                            onClick={goToNextProblem}
                            disabled={currentProblemIndex === problems.length - 1}
                            variant="outline"
                            className="flex-1 ml-2"
                          >
                            Next
                            <ChevronRight size={16} className="ml-1" />
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-6 flex flex-col items-center justify-center text-center h-64">
                        <AlertTriangle size={24} className="text-yellow-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800">No problem selected</h3>
                        <p className="text-gray-600 mt-2">Please select a problem from the list to view its details.</p>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Leaderboard Tab Content */}
              <TabsContent value="leaderboard" className="mt-0 p-4">
                <Card className="p-6">
                  <h2 className="text-lg font-bold mb-6">Competition Leaderboard</h2>
                  
                  {leaderboardLoading ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        The leaderboard will update as participants submit solutions.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rank
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Problems Solved
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Points
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((entry, idx) => (
                            <tr 
                              key={entry.user_id} 
                              className={`${entry.isCurrentUser ? 'bg-blue-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {entry.rank <= 3 ? (
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                      entry.rank === 1 ? 'bg-yellow-100' : 
                                      entry.rank === 2 ? 'bg-gray-100' : 'bg-amber-100'
                                    }`}>
                                      <Medal size={16} className={`${
                                        entry.rank === 1 ? 'text-yellow-500' : 
                                        entry.rank === 2 ? 'text-gray-500' : 'text-amber-600'
                                      }`} />
                                    </div>
                                  ) : (
                                    <span className="text-sm font-medium px-2">#{entry.rank}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-700">
                                    {entry.username ? entry.username.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <span className={`ml-3 font-medium ${entry.isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                                    {entry.username} {entry.isCurrentUser && '(You)'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <CheckCircle size={16} className="text-green-500 mr-2" />
                                  <span>{entry.problems_solved || 0}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Zap size={16} className="text-blue-500 mr-2" />
                                  <span className="font-medium">{entry.total_points || 0}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </TabsContent>
              
              {/* Instructions Tab Content */}
              <TabsContent value="instructions" className="mt-0 p-4">
                <Card className="p-6">
                  <h2 className="text-lg font-bold mb-6">Competition Instructions</h2>
                  
                  <div className="prose max-w-none">
                    <h3>How the Competition Works</h3>
                    <ul>
                      <li><strong>Time Limit:</strong> This competition ends at {new Date(competition?.end_time).toLocaleString()}</li>
                      <li><strong>Scoring:</strong> Each problem has assigned points based on its difficulty</li>
                      <li><strong>Problem Types:</strong> You'll encounter both coding problems and frontend implementation challenges</li>
                      <li><strong>Submissions:</strong> You can submit multiple times, but only your highest-scoring submission counts</li>
                      <li><strong>Leaderboard:</strong> Rankings are determined by total points, and then by submission time in case of ties</li>
                    </ul>

                    <h3>Judging Criteria</h3>
                    <ul>
                      <li><strong>Coding Problems:</strong> Judged automatically based on test cases</li>
                      <li><strong>Frontend Problems:</strong> Reviewed by judges based on functionality, design, and code quality</li>
                    </ul>

                    <h3>Tips for Success</h3>
                    <ul>
                      <li>Start with easier problems to build momentum</li>
                      <li>Make sure to test your solutions thoroughly before submitting</li>
                      <li>Don't spend too much time on a single problem - move on if you're stuck</li>
                      <li>Check the leaderboard regularly to see where you stand</li>
                    </ul>

                    <p>Remember to have fun and good luck!</p>
                  </div>
                </Card>
              </TabsContent>
              
              {/* Discussion Tab Content (if enabled) */}
              {competition?.discussion_enabled && (
                <TabsContent value="discussion" className="mt-0 p-4">
                  <Card className="p-6">
                    <h2 className="text-lg font-bold mb-6">Competition Discussion</h2>
                    
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <MessageSquare className="mx-auto h-12 w-12 text-blue-500" />
                      <h3 className="mt-2 text-lg font-medium text-blue-800">Discussion Forum</h3>
                      <p className="mt-2 text-blue-700">
                        Discuss the competition with other participants. Remember not to share specific solutions!
                      </p>
                      <div className="mt-4">
                        <Button>Join Discussion</Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionWorkspacePage;