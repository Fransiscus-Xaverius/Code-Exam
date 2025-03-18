import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import CompetitionTimer from './CompetitionTimer';

const CompetitorDashboard = ({ activeCompetition }) => {
  const navigate = useNavigate();
  
  if (!activeCompetition) return null;

  return (
    <Card className="p-4 mb-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{activeCompetition.name}</h2>
          <p className="text-sm text-gray-500">Active Competition</p>
        </div>
        <div className="mt-3 sm:mt-0">
          <CompetitionTimer competition={activeCompetition} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Your Rank</p>
          <p className="text-xl font-bold">{activeCompetition.userRank || '-'} / {activeCompetition.participants}</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Points</p>
          <p className="text-xl font-bold">{activeCompetition.userPoints || 0} / {activeCompetition.totalPoints}</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Problems Solved</p>
          <p className="text-xl font-bold">{activeCompetition.problemsSolved || 0} / {activeCompetition.totalProblems}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={() => navigate(`/competitions/${activeCompetition.id}`)}
          className="w-full sm:w-auto"
        >
          Go to Competition
        </Button>
      </div>
    </Card>
  );
};

export default CompetitorDashboard;