// Completed forms table component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from './DataTable';
import { 
  Download, 
  FileText, 
  CheckCircle, 
  Clock, 
  Calendar,
  CreditCard,
  BookOpen,
  ScrollText,
  FileCheck
} from 'lucide-react';

const CompletedFormsTable = ({ 
  forms = [], 
  childName,
  selectedYear,
  onYearChange,
  onDownload, 
  onPrint,
  isProcessing = false 
}) => {
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
        return <FileCheck className="h-5 w-5" />;
    }
  };

  const formatFormName = (formName) => {
    return formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const columns = [
    {
      key: 'formname',
      title: 'Form Name',
      render: (value) => (
        <div className="flex items-center gap-2">
          {renderFormIcon(value)}
          <span className="font-medium">{formatFormName(value)}</span>
        </div>
      )
    },
    {
      key: 'completedTimestamp',
      title: 'Completed Date',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          {value ? new Date(value).toLocaleDateString() : 'Unknown'}
        </div>
      )
    },
    {
      key: 'action',
      title: 'Actions',
      render: (value, row) => {
        const formName = row.formname;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onDownload) onDownload(formName);
              }}
              disabled={isProcessing}
              title="Download form"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onPrint) onPrint(formName);
              }}
              disabled={isProcessing}
              title="Print form"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      sortable: false
    }
  ];

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
              {childName && `Child: ${childName}`}
            </CardDescription>
          </div>
          
          {onYearChange && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <label htmlFor="year" className="text-sm font-medium text-gray-700">
                  Year:
                </label>
                <select
                  name="year"
                  id="year"
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2D52] focus:border-transparent"
                  value={selectedYear}
                  onChange={(e) => onYearChange(parseInt(e.target.value))}
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
          )}
        </div>
      </CardHeader>

      <CardContent>
        {forms.length > 0 ? (
          <div className="overflow-x-auto">
            <DataTable
              data={forms}
              columns={columns}
              tableId="completedForms"
              className="w-full"
              emptyMessage="No completed forms found for the selected year."
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Completed Forms
            </h3>
            <p className="text-gray-500">
              Complete forms from the sidebar to see them here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletedFormsTable;