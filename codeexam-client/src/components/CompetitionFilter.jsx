import React from 'react';
import { Filter } from 'lucide-react';


const filters = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'past', label: 'Past' }
];

export const CompetitionFilter = ({
  currentFilter,
  onFilterChange
}) => {
  return (
    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
      <Filter className="h-5 w-5 text-gray-400" />
      <div className="flex space-x-1">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${currentFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};