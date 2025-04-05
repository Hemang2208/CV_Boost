import React from 'react';
import { useSelector } from 'react-redux';
import { selectLoading } from '../../redux/slices/uiSlice';

const Loading = ({ id, fallback = null, children }) => {
  const isLoading = useSelector((state) => selectLoading(state, id));

  if (!isLoading) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

// Skeleton loader for content that's still loading
export const SkeletonLoader = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-gray-200 rounded mb-2 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        ></div>
      ))}
    </div>
  );
};

// Button with loading state
export const LoadingButton = ({ 
  isLoading, 
  loadingText = 'Processing...', 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <button
      disabled={isLoading}
      className={`relative ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Loading;