// Error display component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorDisplay = ({ error, onRetry }) => {
  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  };

  const getErrorType = () => {
    if (typeof error === 'object' && error?.name) {
      switch (error.name) {
        case 'NetworkError':
          return {
            title: 'Connection Error',
            description: 'Please check your internet connection and try again.',
            action: 'Retry'
          };
        case 'ServiceUnavailableError':
          return {
            title: 'Service Unavailable',
            description: 'Our services are temporarily unavailable. Please try again in a few minutes.',
            action: 'Retry'
          };
        case 'ValidationError':
          return {
            title: 'Data Error',
            description: 'There was a problem with the data received. Please refresh the page.',
            action: 'Refresh'
          };
        default:
          return {
            title: 'Error',
            description: getErrorMessage(),
            action: 'Retry'
          };
      }
    }
    
    return {
      title: 'Error',
      description: getErrorMessage(),
      action: 'Retry'
    };
  };

  const errorInfo = getErrorType();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-red-700">
            {errorInfo.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {errorInfo.description}
          </p>
          
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {errorInfo.action}
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.href = '/login'}
            variant="outline"
            className="w-full"
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorDisplay;