import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { Card } from '../../components/Card';
import { SearchBar } from '../../components/SearchBar';

const FilterPanel = ({ 
  searchTerm, 
  setSearchTerm, 
  difficultyFilter, 
  setDifficultyFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  filtersVisible,
  toggleFilters 
}) => {
  return (
    <Card className="p-4 mb-6">
      {/* Mobile Filters Toggle */}
      <div className="md:hidden flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">Search & Filters</h3>
        <button
          onClick={toggleFilters}
          className="text-blue-600 flex items-center space-x-1"
        >
          <span>{filtersVisible ? 'Hide' : 'Show'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter content - hidden on mobile unless expanded */}
      <div className={`${filtersVisible ? 'block' : 'hidden md:block'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems..."
            className="w-full md:flex-1"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:w-auto md:flex md:gap-4">
            <div className="relative">
              <label htmlFor="difficulty-filter" className="text-xs text-gray-500 mb-1 block">Difficulty</label>
              <select
                id="difficulty-filter"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full appearance-none pr-8"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <Filter size={16} className="absolute right-3 bottom-2.5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <label htmlFor="sort-order" className="text-xs text-gray-500 mb-1 block">Sort By</label>
              <select
                id="sort-order"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-3 py-2 border rounded-lg bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full appearance-none pr-8"
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="difficulty-asc">Difficulty (Easy-Hard)</option>
                <option value="difficulty-desc">Difficulty (Hard-Easy)</option>
                <option value="points-asc">Points (Low-High)</option>
                <option value="points-desc">Points (High-Low)</option>
              </select>
              <Filter size={16} className="absolute right-3 bottom-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FilterPanel;