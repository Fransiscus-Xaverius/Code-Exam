import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination navigation">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentPage === 1
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 active:bg-gray-100 border border-gray-200 shadow-sm'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentPage === page
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 active:bg-gray-100 border border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentPage === totalPages
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 active:bg-gray-100 border border-gray-200 shadow-sm'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </nav>
  );
};