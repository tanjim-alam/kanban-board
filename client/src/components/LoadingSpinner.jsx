import React from 'react';
import clsx from 'clsx';

const LoadingSpinner = ({ size = 'medium', className }) => {
  return (
    <div className={`loading-spinner ${className || ''}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
