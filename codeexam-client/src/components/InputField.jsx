import React from 'react';

export const InputField = ({ 
  label, 
  type = 'text', 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-gray-700 font-medium mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className="
          w-full px-4 py-2
          border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          text-gray-700
        "
        {...props}
      />
    </div>
  );
};