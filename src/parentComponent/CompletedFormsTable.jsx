import React, { useState, useEffect } from 'react';
import DataTable from '../DataTable';

const CompletedFormsTable = ({ childId, onClose }) => {
  const [completedForms, setCompletedForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (childId) {
      loadCompletedForms();
    }
  }, [childId, selectedYear]);

  const loadCompletedForms = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/completed_form_status_year/${childId}/${selectedYear}`
      );
      const data = await response.json();
      
      if (data.CompletedFormStatus) {
        const formsWithFormattedDate = data.CompletedFormStatus.map(form => ({
          ...form,
          completedTimestamp: new Date(form.completedTimestamp).toLocaleString()
        }));
        setCompletedForms(formsWithFormattedDate);
      } else {
        setCompletedForms([]);
      }
    } catch (error) {
      // console.error('Error loading completed forms:', error);
      setCompletedForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (formName, url) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      
      // Create hidden div for PDF generation
      const hiddenDiv = document.createElement('div');
      hiddenDiv.id = 'formContent';
      hiddenDiv.style.display = 'none';
      hiddenDiv.innerHTML = text;
      document.body.appendChild(hiddenDiv);

      // Generate PDF using jsPDF
      if (window.jspdf) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', [1500, 1400]);
        
        doc.html(hiddenDiv, {
          callback: function () {
            doc.save(`${formName}.pdf`);
            document.body.removeChild(hiddenDiv);
          },
          x: 12,
          y: 12,
          autoPaging: 'slice',
          html2canvas: { scale: 0.75 },
          pagesplit: true,
        });
      }
    } catch (error) {
      // console.error('Error downloading form:', error);
    }
  };

  const handlePrint = async (formName, url) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      
      const printWindow = window.open('', '', 'height=1400,width=1500');
      printWindow.document.write('<html><head><title>Print Form</title>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(text);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      
      printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      // console.error('Error printing form:', error);
    }
  };

  const getFormUrls = (formName) => {
    const baseUrl = window.location.origin;
    switch (formName) {
      case 'admission_form':
        return {
          download: `${baseUrl}/admission_form_completed.html?id=${childId}`,
          print: `${baseUrl}/admission_form_pdf_completed.html?id=${childId}`
        };
      case 'authorization_form':
        return {
          download: `${baseUrl}/authorization_completed.html?id=${childId}`,
          print: `${baseUrl}/authorization_pdf_completed.html?id=${childId}`
        };
      case 'enrollment_form':
        return {
          download: `${baseUrl}/enrollment_agreement_completed.html?id=${childId}`,
          print: `${baseUrl}/enrollment_agreement_pdf_completed.html?id=${childId}`
        };
      case 'parent_handbook':
        return {
          download: `${baseUrl}/parent_handbook_completed.html?id=${childId}`,
          print: `${baseUrl}/parent_handbook_pdf_completed.html?id=${childId}`
        };
      default:
        return { download: '', print: '' };
    }
  };

  const columns = [
    {
      key: 'formname',
      title: 'Form Name'
    },
    {
      key: 'completedTimestamp',
      title: 'Completed Date'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => {
        const urls = getFormUrls(row.formname);
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload(row.formname, urls.download)}
              className="text-[#0F2D52] hover:text-blue-800"
              title="Download"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
                <path fill="currentColor" d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM376.9 294.6L269.8 394.5c-3.8 3.5-8.7 5.5-13.8 5.5s-10.1-2-13.8-5.5L135.1 294.6c-4.5-4.2-7.1-10.1-7.1-16.3c0-12.3 10-22.3 22.3-22.3l57.7 0 0-96c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32l0 96 57.7 0c12.3 0 22.3 10 22.3 22.3c0 6.2-2.6 12.1-7.1 16.3z"/>
              </svg>
            </button>
            <button
              onClick={() => handlePrint(row.formname, urls.print)}
              className="text-[#0F2D52] hover:text-blue-800 ml-2"
              title="Print"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
                <path fill="currentColor" d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 368 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V384zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
              </svg>
            </button>
          </div>
        );
      },
      sortable: false
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-[#0F2D52]">Completed Forms</h3>
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Forms
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Year:
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0F2D52]"
        >
          {[...Array(5)].map((_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      <DataTable
        data={completedForms}
        columns={columns}
        loading={loading}
        className="completed-forms-table"
      />
    </div>
  );
};

export default CompletedFormsTable;