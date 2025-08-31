// Table displaying completed forms with download/print actions
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  Clock,
  CheckCircle,
  BookOpen,
  CreditCard,
  ScrollText,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { api_base_url } from '@/utils/const';
import { getAuthHeaders } from '@/utils/auth';
import { useAuth0 } from '@auth0/auth0-react';

const CompletedFormsTable = ({ forms, childName, childId }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Form icon mapping
  const renderFormIcon = (formName) => {
    switch (formName) {
      case 'admission_form':
        return <FileText className="h-5 w-5" />;
      case 'authorization_form':
        return <CreditCard className="h-5 w-5" />;
      case 'parent_handbook':
        return <BookOpen className="h-5 w-5" />;
      case 'enrollment_form':
      case 'enrollment_agreement':
        return <ScrollText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Format form name for display
  const formatFormName = (formName) => {
    return formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Simple file operations
  const handleDownload = async (formName) => {
    if (!childId) {
      toast.error('Child ID not found. Please select a child.');
      return;
    }

    setIsProcessing(true);
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(
        `${api_base_url}/get-s3-file/lynnwood/${childId}/${formName}/false`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.download_url || !data.filename) {
        throw new Error('File not found. Please contact support.');
      }

      // Create download link
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${formatFormName(formName)} downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Download failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = async (formName) => {
    if (!childId) {
      toast.error('Child ID not found. Please select a child.');
      return;
    }

    setIsProcessing(true);
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(
        `${api_base_url}/get-s3-file/lynnwood/${childId}/${formName}/true`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Print failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.download_url) {
        throw new Error('Print URL not available. Please contact support.');
      }

      // Open in new window for printing
      const printWindow = window.open(data.download_url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => printWindow.print(), 500);
        };
      }

      toast.success(`${formatFormName(formName)} opened for printing`);
    } catch (error) {
      console.error('Print error:', error);
      toast.error(`Print failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#0F2D52] flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Forms
            </CardTitle>
            <CardDescription>
              {childName ? `Child: ${childName}` : 'Select a child to view forms'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <label htmlFor="year" className="text-sm font-medium text-gray-700">Year:</label>
              <select
                name="year"
                id="year"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2D52] focus:border-transparent"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[...Array(11)].map((_, i) => {
                  const year = new Date().getFullYear() - 10 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!forms || forms.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No completed forms</h3>
            <p className="text-gray-600">
              {childName ? `${childName} hasn't completed any forms yet.` : 'Select a child to view their completed forms.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Form Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Completed Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {renderFormIcon(form.formname)}
                        <span className="font-medium">{formatFormName(form.formname)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {form.completedTimestamp ? 
                          new Date(form.completedTimestamp).toLocaleDateString() : 
                          'Unknown'
                        }
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(form.formname)}
                          disabled={isProcessing}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrint(form.formname)}
                          disabled={isProcessing}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletedFormsTable;