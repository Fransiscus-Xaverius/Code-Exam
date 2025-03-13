import React from 'react';
import { Calendar, Users, Trophy } from 'lucide-react';

// interface CompetitionCardProps {
//   competition: {
//     id: string;
//     name: string;
//     description: string;
//     start_time: string;
//     end_time: string;
//     registration_required: boolean;
//     leaderboard_visible: boolean;
//   };
//   status: 'upcoming' | 'ongoing' | 'past';
//   onViewDetails: () => void;
// }

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
  ongoing: 'bg-green-100 text-green-800 border-green-200',
  past: 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusIcons = {
  upcoming: Calendar,
  ongoing: Trophy,
  past: Users
};

export const CompetitionCard = ({
  competition,
  status,
  onViewDetails
}) => {
  const StatusIcon = statusIcons[status];
  const formattedStartDate = new Date(competition.start_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const formattedEndDate = new Date(competition.end_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
              {competition.name}
            </h3>
            <span 
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]} border shadow-sm`}
              role="status"
              aria-label={`Competition status: ${status}`}
            >
              <StatusIcon className="w-4 h-4 mr-1" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2 min-h-[48px] group-hover:text-gray-900 transition-colors duration-200">
          {competition.description}
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {formattedStartDate} - {formattedEndDate}
            </span>
          </div>
          
          {competition.registration_required && (
            <div className="flex items-center text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">Registration required</span>
            </div>
          )}
          
          {competition.leaderboard_visible && (
            <div className="flex items-center text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
              <Trophy className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">Public leaderboard</span>
            </div>
          )}
        </div>

        <button
          onClick={onViewDetails}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`View details for ${competition.name}`}
        >
          View Details
          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};