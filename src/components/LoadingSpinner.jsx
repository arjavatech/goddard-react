// Loading spinner component
import { Card, CardContent } from '@/components/ui/card';

const LoadingSpinner = ({ message = 'Loading...', size = 'default' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-sm mx-4">
        <CardContent className="p-8 text-center">
          <div className={`animate-spin rounded-full border-b-2 border-[#0F2D52] mx-auto mb-4 ${sizeClasses[size]}`}></div>
          <h3 className="text-lg font-semibold text-[#0F2D52] mb-2">
            {message}
          </h3>
          <p className="text-sm text-gray-600">
            Please wait while we load your data...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingSpinner;