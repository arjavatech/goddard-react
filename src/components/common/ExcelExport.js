export const exportToExcel = (tableId, filename = 'export.xlsx') => {
  if (window.XLSX) {
    const elt = document.getElementById(tableId);
    const wb = window.XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
    window.XLSX.writeFile(wb, filename);
  }
};

export const exportToCSV = (data, headers, filename = 'export.csv') => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => `"${row[header] || ''}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToCSVFromData = (data, headerMapping, filename = 'export.csv') => {
  const headers = Object.keys(headerMapping);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => `"${headerMapping[header](row) || ''}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};