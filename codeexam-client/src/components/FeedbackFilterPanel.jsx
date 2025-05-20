import React from 'react';
import { Filter, Search, X, ChevronDown, RefreshCw } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const FeedbackFilterPanel = ({ 
  filters, 
  onFilterChange, 
  onReset, 
  filtersVisible, 
  toggleFilters 
}) => {
  return (
    <Card className="p-4 mb-6">
      {/* Mobile Filters Toggle */}
      <div className="md:hidden flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">Filters</h3>
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
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search feedback content..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange('search', '')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category dropdown */}
            <div className="relative">
              <label htmlFor="category-filter" className="sr-only">Category</label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => onFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white pr-10 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="content">Content Feedback</option>
                <option value="usability">Usability</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Status dropdown */}
            <div className="relative">
              <label htmlFor="status-filter" className="sr-only">Status</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white pr-10 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="addressed">Addressed</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            
            {/* Rating filter */}
            <div className="relative">
              <label htmlFor="rating-filter" className="sr-only">Rating</label>
              <select
                id="rating-filter"
                value={filters.rating}
                onChange={(e) => onFilterChange('rating', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white pr-10 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Reset filters button */}
            <div className="flex items-end">
              <Button
                onClick={onReset}
                variant="secondary"
                className="w-full flex items-center justify-center"
                disabled={!Object.values(filters).some(v => v !== '')}
              >
                <RefreshCw size={16} className="mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced filters - Date range */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-xs font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-xs font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={filters.endDate}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FeedbackFilterPanel;