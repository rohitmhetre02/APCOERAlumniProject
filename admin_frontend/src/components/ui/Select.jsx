import React from 'react';

const Select = ({ children, value, onValueChange, className = '', ...props }) => {
  return (
    <select
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      {...props}
    >
      {children}
    </select>
  );
};

const SelectTrigger = ({ children, className = '', ...props }) => {
  return (
    <div className={`relative ${className}`} {...props}>
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder, className = '', ...props }) => {
  return (
    <span className={`block truncate ${className}`} {...props}>
      {placeholder}
    </span>
  );
};

const SelectContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg ${className}`} {...props}>
      {children}
    </div>
  );
};

const SelectItem = ({ children, value, className = '', ...props }) => {
  return (
    <option
      value={value}
      {...props}
    >
      {children}
    </option>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
