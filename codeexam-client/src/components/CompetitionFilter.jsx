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
    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center text-gray-500 gap-1.5">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filter</span>
      </div>
      <div className="flex gap-1.5">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentFilter === filter.id
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            aria-pressed={currentFilter === filter.id}
            role="radio"
            aria-checked={currentFilter === filter.id}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};