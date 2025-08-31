// Enhanced file service for S3 operations
import { apiClient } from '../api/client.js';
import { ENDPOINTS, FILE_TYPES, DEFAULT_SCHOOL_NAME } from '../api/endpoints.js';

class FileOperationError extends Error {
  constructor(message, originalError, operation) {
    super(message);
    this.name = 'FileOperationError';
    this.originalError = originalError;
    this.operation = operation;
  }
}

export class FileService {
  /**
   * Download or print a form
   * @param {number} childId - Child ID
   * @param {string} formType - Form type
   * @param {boolean} shouldPrint - Whether to print or download
   * @param {Function} getAccessTokenSilently - Auth0 token function
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  static async processForm(childId, formType, shouldPrint = false, getAccessTokenSilently, options = {}) {
    const { schoolName = DEFAULT_SCHOOL_NAME } = options;
    
    if (!childId) {
      throw new FileOperationError('Child ID is required', null, shouldPrint ? 'print' : 'download');
    }

    const fileType = FILE_TYPES[formType];
    if (!fileType) {
      throw new FileOperationError(`Unknown form type: ${formType}`, null, shouldPrint ? 'print' : 'download');
    }

    try {
      console.log(`${shouldPrint ? 'Printing' : 'Downloading'} ${formType} for child ${childId}`);
      
      const response = await apiClient.get(
        ENDPOINTS.S3_FILE(schoolName, childId, fileType, shouldPrint),
        { getAccessTokenSilently }
      );

      if (!response.s3_location || !response.filename) {
        throw new FileOperationError(
          'File not found. Please contact support.',
          null,
          shouldPrint ? 'print' : 'download'
        );
      }

      if (!response.download_url) {
        throw new FileOperationError(
          `${shouldPrint ? 'Print' : 'Download'} URL not available. Please contact support.`,
          null,
          shouldPrint ? 'print' : 'download'
        );
      }

      if (shouldPrint) {
        await this.printFile(response.download_url, formType);
      } else {
        await this.downloadFile(response.download_url, response.filename, formType);
      }

    } catch (error) {
      console.error(`Error ${shouldPrint ? 'printing' : 'downloading'} ${formType}:`, error);
      
      if (error instanceof FileOperationError) {
        throw error;
      }
      
      throw new FileOperationError(
        `Failed to ${shouldPrint ? 'print' : 'download'} ${formType}: ${error.message}`,
        error,
        shouldPrint ? 'print' : 'download'
      );
    }
  }

  /**
   * Download a form file
   * @param {number} childId - Child ID
   * @param {string} formType - Form type
   * @param {Function} getAccessTokenSilently - Auth0 token function
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  static async downloadForm(childId, formType, getAccessTokenSilently, options = {}) {
    return this.processForm(childId, formType, false, getAccessTokenSilently, options);
  }

  /**
   * Print a form file
   * @param {number} childId - Child ID
   * @param {string} formType - Form type
   * @param {Function} getAccessTokenSilently - Auth0 token function
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  static async printForm(childId, formType, getAccessTokenSilently, options = {}) {
    return this.processForm(childId, formType, true, getAccessTokenSilently, options);
  }

  /**
   * Handle file download from URL
   * @param {string} downloadUrl - File download URL
   * @param {string} filename - Filename
   * @param {string} formType - Form type for success message
   * @returns {Promise<void>}
   */
  static async downloadFile(downloadUrl, filename, formType) {
    try {
      const response = await fetch(downloadUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create download link
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(link.href);

      console.log(`${formType} downloaded successfully`);

    } catch (downloadError) {
      console.error('Download error:', downloadError);

      // Fallback strategies for CORS issues
      if (downloadError.name === 'TypeError' || downloadError.message.includes('CORS')) {
        await this.handleCorsDownload(downloadUrl);
      } else {
        throw new FileOperationError(
          `Download failed: ${downloadError.message}`,
          downloadError,
          'download'
        );
      }
    }
  }

  /**
   * Handle CORS-restricted downloads
   * @param {string} downloadUrl - File download URL
   * @returns {Promise<void>}
   */
  static async handleCorsDownload(downloadUrl) {
    try {
      // Strategy 1: Direct navigation
      window.location.href = downloadUrl;
      return;
    } catch (locationError) {
      console.warn('Direct navigation failed, trying iframe method');
      
      // Strategy 2: Hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);

      // Clean up iframe after delay
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    }
  }

  /**
   * Handle file printing
   * @param {string} downloadUrl - File download URL
   * @param {string} formType - Form type for success message
   * @returns {Promise<void>}
   */
  static async printFile(downloadUrl, formType) {
    try {
      const response = await fetch(downloadUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Print fetch failed: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Open in new window for printing
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
        
        // Clean up blob URL after delay
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 5000);
      } else {
        throw new Error('Popup blocked - please allow popups for printing');
      }
      
      console.log(`${formType} opened for printing`);
      
    } catch (printError) {
      console.error('Print error:', printError);
      
      // Fallback for CORS issues
      if (printError.name === 'TypeError' || printError.message.includes('CORS')) {
        const printWindow = window.open(downloadUrl, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          };
        } else {
          throw new FileOperationError('Popup blocked - please allow popups for printing', printError, 'print');
        }
      } else {
        throw new FileOperationError(`Print failed: ${printError.message}`, printError, 'print');
      }
    }
  }

  /**
   * Check if file exists for a form
   * @param {number} childId - Child ID
   * @param {string} formType - Form type
   * @param {Function} getAccessTokenSilently - Auth0 token function
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} Whether file exists
   */
  static async fileExists(childId, formType, getAccessTokenSilently, options = {}) {
    const { schoolName = DEFAULT_SCHOOL_NAME } = options;
    
    const fileType = FILE_TYPES[formType];
    if (!fileType) return false;

    try {
      const response = await apiClient.get(
        ENDPOINTS.S3_FILE(schoolName, childId, fileType, false),
        { getAccessTokenSilently }
      );
      
      return !!(response.s3_location && response.filename && response.download_url);
    } catch (error) {
      console.warn(`Error checking file existence for ${formType}:`, error);
      return false;
    }
  }

  /**
   * Get file information without downloading
   * @param {number} childId - Child ID
   * @param {string} formType - Form type
   * @param {Function} getAccessTokenSilently - Auth0 token function
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} File information
   */
  static async getFileInfo(childId, formType, getAccessTokenSilently, options = {}) {
    const { schoolName = DEFAULT_SCHOOL_NAME } = options;
    
    const fileType = FILE_TYPES[formType];
    if (!fileType) {
      throw new FileOperationError(`Unknown form type: ${formType}`, null, 'info');
    }

    try {
      const response = await apiClient.get(
        ENDPOINTS.S3_FILE(schoolName, childId, fileType, false),
        { getAccessTokenSilently }
      );
      
      return {
        exists: !!(response.s3_location && response.filename),
        filename: response.filename,
        s3Location: response.s3_location,
        downloadUrl: response.download_url,
        formType,
        childId
      };
    } catch (error) {
      throw new FileOperationError(
        `Failed to get file info for ${formType}: ${error.message}`,
        error,
        'info'
      );
    }
  }
}

// Export error class
export { FileOperationError };