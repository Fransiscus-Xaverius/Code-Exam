import React from 'react';

export const InputField = ({ 
  label, 
  type = 'text',
  name,
  value,
  onChange,
  required = false,
  placeholder = '',
  error = false,
  className = '',
  disabled = false,
  autoComplete = type === 'password' ? 'current-password' : 'on',
  ...props 
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={`
          w-full px-4 py-2
          border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          text-gray-700
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        {...props}
      />
      {error && typeof error === 'string' && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};