import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
      <img 
        src="image/loading.gif" 
        alt="Loading..." 
        className="w-36 h-36"
      />
    </div>
  );
};

export default LoadingSpinner;