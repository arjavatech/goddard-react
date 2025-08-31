// Hook for file download and print operations
import { useState, useCallback } from 'react';
import { FileService } from '../services/parentDashboard/fileService.js';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';

export function useFileOperations() {
  const { getAccessTokenSilently } = useAuth0();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState(null);

  const downloadForm = useCallback(async (childId, formType) => {
    if (!childId) {
      toast.error('Child ID not found. Please select a child and try again.');
      return;
    }

    setIsProcessing(true);
    setCurrentOperation({ type: 'download', formType, childId });

    try {
      console.log(`Starting download for ${formType}, child ${childId}`);
      const startTime = performance.now();

      await FileService.downloadForm(childId, formType, getAccessTokenSilently);
      
      const duration = performance.now() - startTime;
      console.log(`Download completed in ${duration.toFixed(2)}ms`);
      
      toast.success(`${formatFormName(formType)} downloaded successfully`, {
        duration: 3000
      });

    } catch (error) {
      console.error(`Download failed for ${formType}:`, error);
      handleFileError(error, 'download', formType);
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
    }
  }, [getAccessTokenSilently]);

  const printForm = useCallback(async (childId, formType) => {
    if (!childId) {
      toast.error('Child ID not found. Please select a child and try again.');
      return;
    }

    setIsProcessing(true);
    setCurrentOperation({ type: 'print', formType, childId });

    try {
      console.log(`Starting print for ${formType}, child ${childId}`);
      const startTime = performance.now();

      await FileService.printForm(childId, formType, getAccessTokenSilently);
      
      const duration = performance.now() - startTime;
      console.log(`Print initiated in ${duration.toFixed(2)}ms`);
      
      toast.success(`${formatFormName(formType)} opened for printing`, {
        duration: 3000
      });

    } catch (error) {
      console.error(`Print failed for ${formType}:`, error);
      handleFileError(error, 'print', formType);
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
    }
  }, [getAccessTokenSilently]);

  const checkFileExists = useCallback(async (childId, formType) => {
    if (!childId) return false;

    try {
      return await FileService.fileExists(childId, formType, getAccessTokenSilently);
    } catch (error) {
      console.warn(`Error checking file existence for ${formType}:`, error);
      return false;
    }
  }, [getAccessTokenSilently]);

  const getFileInfo = useCallback(async (childId, formType) => {
    if (!childId) return null;

    try {
      return await FileService.getFileInfo(childId, formType, getAccessTokenSilently);
    } catch (error) {
      console.warn(`Error getting file info for ${formType}:`, error);
      return null;
    }
  }, [getAccessTokenSilently]);

  // Process multiple forms (batch operations)
  const processMultipleForms = useCallback(async (childId, formTypes, operation = 'download') => {
    if (!childId || !formTypes?.length) {
      toast.error('Invalid parameters for batch operation');
      return;
    }

    setIsProcessing(true);
    setCurrentOperation({ type: 'batch', operation, formTypes, childId });

    const results = [];
    const errors = [];

    for (const formType of formTypes) {
      try {
        if (operation === 'download') {
          await FileService.downloadForm(childId, formType, getAccessTokenSilently);
        } else if (operation === 'print') {
          await FileService.printForm(childId, formType, getAccessTokenSilently);
        }
        
        results.push({ formType, success: true });
        
        // Small delay between operations to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Batch ${operation} failed for ${formType}:`, error);
        results.push({ formType, success: false, error: error.message });
        errors.push(`${formatFormName(formType)}: ${error.message}`);
      }
    }

    setIsProcessing(false);
    setCurrentOperation(null);

    // Show summary toast
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    if (failureCount === 0) {
      toast.success(`Successfully ${operation}ed ${successCount} forms`, {
        duration: 4000
      });
    } else if (successCount === 0) {
      toast.error(`Failed to ${operation} all forms`, {
        duration: 5000,
        description: errors.join(', ')
      });
    } else {
      toast.warning(`${operation}ed ${successCount} forms, ${failureCount} failed`, {
        duration: 5000,
        description: errors.join(', ')
      });
    }

    return results;
  }, [getAccessTokenSilently]);

  // Handle file operation errors with user-friendly messages
  const handleFileError = (error, operation, formType) => {
    const formName = formatFormName(formType);
    const actionName = operation === 'download' ? 'download' : 'print';

    if (error.name === 'FileOperationError') {
      if (error.message.includes('not found')) {
        toast.error(`${formName} file not found. The form may not be completed yet.`, {
          duration: 5000
        });
      } else if (error.message.includes('Popup blocked')) {
        toast.error('Please allow popups for this site to enable printing.', {
          duration: 5000,
          action: {
            label: 'How to enable',
            onClick: () => {
              toast.info('Go to your browser settings and allow popups for this site.', {
                duration: 8000
              });
            }
          }
        });
      } else {
        toast.error(`Failed to ${actionName} ${formName}: ${error.message}`, {
          duration: 5000
        });
      }
    } else if (error.name === 'NetworkError') {
      toast.error(`Network error while trying to ${actionName} ${formName}. Please check your connection.`, {
        duration: 5000
      });
    } else {
      toast.error(`Unable to ${actionName} ${formName}. Please try again or contact support.`, {
        duration: 5000
      });
    }
  };

  // Format form names for display
  const formatFormName = (formType) => {
    const formNames = {
      admission_form: 'Admission Form',
      authorization_form: 'Authorization Form',
      parent_handbook: 'Parent Handbook',
      enrollment_form: 'Enrollment Agreement',
      enrollment_agreement: 'Enrollment Agreement'
    };

    return formNames[formType] || formType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Cancel current operation (if possible)
  const cancelOperation = useCallback(() => {
    if (isProcessing) {
      console.log('Canceling current file operation...');
      setIsProcessing(false);
      setCurrentOperation(null);
      toast.info('File operation canceled');
    }
  }, [isProcessing]);

  return {
    // State
    isProcessing,
    currentOperation,
    
    // Actions
    downloadForm,
    printForm,
    checkFileExists,
    getFileInfo,
    processMultipleForms,
    cancelOperation,
    
    // Utilities
    formatFormName,
    
    // Computed
    canPerformOperation: !isProcessing,
    operationProgress: currentOperation ? {
      type: currentOperation.type,
      formType: currentOperation.formType,
      formName: formatFormName(currentOperation.formType)
    } : null
  };
}