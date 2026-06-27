'use client';

import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...', fullPage = false }) => {
  const containerClass = fullPage
    ? 'flex align-items-center justify-content-center'
    : 'flex align-items-center justify-content-center p-5';

  return (
    <div className={containerClass} style={fullPage ? { minHeight: '60vh' } : {}}>
      <div className="flex flex-column align-items-center gap-3">
        {/* Spinner */}
        <div className="loading-spinner" />
        {/* Text */}
        <span className="text-lg font-medium text-600">{text}</span>
      </div>

      <style jsx>{`
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #e74c3c;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
