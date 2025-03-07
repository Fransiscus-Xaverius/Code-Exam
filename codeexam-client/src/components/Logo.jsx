import React from 'react';

export const Logo = ({ className = '' }) => {
  return (
    <div className={`text-blue-600 ${className}`}>
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
        <path d="M2 17L12 22L22 17" />
        <path d="M2 12L12 17L22 12" />
      </svg>
    </div>
  );
};