import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`
        bg-white 
        rounded-lg 
        shadow-lg
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};