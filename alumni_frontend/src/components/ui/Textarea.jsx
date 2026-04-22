import React from 'react';

const Textarea = ({ 
  className = '', 
  placeholder = '', 
  value = '', 
  onChange, 
  rows = 4,
  disabled = false,
  required = false,
  ...props 
}) => {
  return (
    <textarea
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      required={required}
      {...props}
    />
  );
};

export default Textarea;
