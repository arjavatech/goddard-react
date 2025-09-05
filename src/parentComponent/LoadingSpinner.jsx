import React from 'react';

const LoadingSpinner = ({ 
  message = "Loading...", 
  className = "",
  size = "large",
  showLogo = false,
  overlay = false
}) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-10 w-10", 
    large: "h-16 w-16"
  };

  const baseClasses = overlay 
    ? "fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50"
    : className || "min-h-screen bg-gray-50 flex items-center justify-center";

  return (
    <div className={baseClasses}>
      <div className="text-center">
        {showLogo && (
          <div className="mb-6">
            <img 
              src="/image/gs_logo_lynnwood.png" 
              alt="Goddard School" 
              className="h-20 w-auto mx-auto"
            />
          </div>
        )}
        
        {/* Try loading.gif first, fallback to CSS spinner */}
        <div className="mb-4">
          <img 
            src="image/loading.gif" 
            alt="Loading..." 
            className={`mx-auto ${size === 'large' ? 'w-36 h-36' : size === 'medium' ? 'w-24 h-24' : 'w-16 h-16'}`}
            onError={(e) => {
              // Fallback to CSS spinner if GIF fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div 
            className={`animate-spin ${sizeClasses[size]} border-4 border-[#0F2D52] border-t-transparent rounded-full mx-auto`}
            style={{ display: 'none' }}
          />
        </div>
        
        <p className="text-gray-600 font-medium">
          {message}
        </p>
        
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-[#0F2D52] rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-[#0F2D52] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-2 w-2 bg-[#0F2D52] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;