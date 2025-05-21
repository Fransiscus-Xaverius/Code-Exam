import React from 'react';
import { Award, BookOpen, Zap, Trophy, Target, CheckCircle, Code, Star } from 'lucide-react';
import { Card } from '../Card';

const Achievements = ({ stats = {} }) => {
  // Define achievements based on stats
  const achievements = [
    {
      id: 'first-solve',
      name: 'First Blood',
      description: 'Solved your first coding problem',
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      unlocked: stats.problemsSolved > 0,
    },
    {
      id: 'five-problems',
      name: 'Getting Started',
      description: 'Solved 5 coding problems',
      icon: <Code className="h-8 w-8 text-blue-500" />,
      unlocked: stats.problemsSolved >= 5,
    },
    {
      id: 'ten-submissions',
      name: 'Persistent',
      description: 'Made 10 submissions',
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      unlocked: stats.submissionsCount >= 10,
    },
    {
      id: 'competition-join',
      name: 'Competitor',
      description: 'Participated in your first competition',
      icon: <Trophy className="h-8 w-8 text-purple-500" />,
      unlocked: stats.competitionsCount > 0,
    },
    {
      id: 'high-score',
      name: 'High Scorer',
      description: 'Achieved a score of 100 points or more',
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      unlocked: stats.totalPoints >= 100,
    },
    {
      id: 'accurate',
      name: 'Sharpshooter',
      description: 'Achieved an acceptance rate of 80% or higher',
      icon: <Target className="h-8 w-8 text-red-500" />,
      unlocked: parseFloat(stats.acceptanceRate) >= 80,
    },
  ];

  // Count unlocked achievements
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <Award className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold">Achievements</h2>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{unlockedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`border rounded-lg p-4 flex items-start gap-3 transition-all ${
              achievement.unlocked
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50 opacity-50'
            }`}
          >
            <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-white' : 'bg-gray-200'}`}>
              {achievement.icon}
            </div>
            <div>
              <h3 className="font-medium">{achievement.name}</h3>
              <p className="text-sm text-gray-600">{achievement.description}</p>
              {achievement.unlocked ? (
                <p className="text-xs text-green-600 mt-1">Unlocked</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Locked</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Achievements;