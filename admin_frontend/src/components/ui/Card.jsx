import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6', 
  shadow = 'shadow-sm',
  border = 'border border-gray-200',
  rounded = 'rounded-lg'
}) => {
  return (
    <div className={`bg-white ${rounded} ${shadow} ${border} ${padding} ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ 
  children, 
  className = '', 
  padding = 'p-6 pb-4'
}) => {
  return (
    <div className={`${padding} ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ 
  children, 
  className = 'text-lg font-semibold text-gray-900'
}) => {
  return (
    <h3 className={className}>
      {children}
    </h3>
  );
};

const CardContent = ({ 
  children, 
  className = 'p-6 pt-0'
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default Card;
export { CardHeader, CardTitle, CardContent };
