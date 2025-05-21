import React, { useState, useEffect } from 'react';
import { CheckCircle, Award, BarChart2, Clock } from 'lucide-react';
import { Card } from '../Card';
import API from '../helpers/API';

const UserStats = ({ userId, token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    problemsSolved: 0,
    totalPoints: 0,
    submissionsCount: 0,
    competitionsCount: 0,
    acceptanceRate: 0,
    averageScore: 0
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        
        // Get submission statistics
        const submissionStatsResponse = await API.get('/api/submissions/stats', {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        
        if (submissionStatsResponse.data.success) {
          const submissionStats = submissionStatsResponse.data.stats;
          
          // Calculate acceptance rate
          const acceptedCount = submissionStats.statusCounts.find(s => s.status === 'accepted')?.count || 0;
          const totalSubmissions = submissionStats.statusCounts.reduce((sum, status) => sum + parseInt(status.count), 0) || 1;
          const acceptanceRate = (acceptedCount / totalSubmissions) * 100;
          
          // Calculate total score from problem counts
          const totalPoints = submissionStats.problemCounts.reduce((sum, problem) => {
            // Check if problem.problem exists and has a title property
            if (problem.problem && problem.problem.title) {
              return sum + (problem.count * (problem.points || 0));
            }
            return sum;
          }, 0);
          
          // Calculate average score per solved problem
          const averageScore = totalPoints / (submissionStats.problemCounts.length || 1);
          
          setStats({
            problemsSolved: submissionStats.problemCounts.length || 0,
            totalPoints: totalPoints,
            submissionsCount: totalSubmissions,
            competitionsCount: 0, // We'll update this if we add a competitions API call
            acceptanceRate: acceptanceRate.toFixed(1),
            averageScore: averageScore.toFixed(1)
          });
        }
        
        // TODO: Fetch competition statistics if needed
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to load user statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId && token) {
      fetchUserStats();
    }
  }, [userId, token]);
  
  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <h2 className="text-lg font-semibold mb-4 bg-gray-200 h-6 w-36 rounded"></h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg h-24"></div>
          <div className="bg-gray-100 p-4 rounded-lg h-24"></div>
          <div className="bg-gray-100 p-4 rounded-lg h-24"></div>
          <div className="bg-gray-100 p-4 rounded-lg h-24"></div>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-medium text-green-800">Problems Solved</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.problemsSolved}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Award className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-800">Total Points</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.totalPoints}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <BarChart2 className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-medium text-purple-800">Acceptance Rate</h3>
          </div>
          <p className="text-2xl font-bold text-purple-700">{stats.acceptanceRate}%</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="font-medium text-yellow-800">Submissions</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{stats.submissionsCount}</p>
        </div>
      </div>
    </Card>
  );
};

export default UserStats;