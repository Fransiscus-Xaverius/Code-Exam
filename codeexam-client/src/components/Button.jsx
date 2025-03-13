import React from 'react';

export const Button = ({ 
  children, 
  type = 'button', 
  fullWidth = false, 
  disabled = false, 
  className = '',
  // Add leftIcon prop
  leftIcon = null,
  ...props 
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        py-2 px-4 
        bg-blue-600 hover:bg-blue-700 
        text-white font-medium 
        rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Render the icon if provided */}
      {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
      {children}
    </button>
  );
};
