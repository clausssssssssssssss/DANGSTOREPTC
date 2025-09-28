import React from 'react';

const Alert = ({ children, variant = 'default', className = '', ...props }) => {
  const baseClasses = 'p-4 rounded-md border flex items-start gap-3';
  
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const AlertTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`font-semibold text-sm ${className}`} {...props}>
      {children}
    </h3>
  );
};

const AlertDescription = ({ children, className = '', ...props }) => {
  return (
    <div className={`text-sm mt-1 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription };
export default Alert;
