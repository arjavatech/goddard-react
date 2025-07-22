import React, { useRef, useState, useMemo } from 'react';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  onExportExcel,
  className = ""
}) => {
  const tableRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 10;

  // Filtered data
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue, bValue;
      
      if (sortConfig.key === 'child_name') {
        aValue = `${a.child_first_name || ''} ${a.child_last_name || ''}`.toLowerCase().trim();
        bValue = `${b.child_first_name || ''} ${b.child_last_name || ''}`.toLowerCase().trim();
      } else {
        aValue = a[sortConfig.key]?.toString().toLowerCase() ?? '';
        bValue = b[sortConfig.key]?.toString().toLowerCase() ?? '';
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginated data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
   
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <button
        key="prev"
        className={`px-2 py-1 sm:px-4 sm:py-2 rounded bg-gray-400 text-white text-xs sm:text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        
        <button
          key={i}
          className={`px-2 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm ${currentPage === i ? 'bg-[#0F2D52] text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        className={`px-2 py-1 sm:px-4 sm:py-2 rounded bg-gray-400 text-white text-xs sm:text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    );

    return pages;
  };

  return (
    <div className="dataTables_wrapper text-sm">
  {/* Top Controls */}
  <div className="flex flex-col sm:flex-row justify-end items-start sm:items-end mb-4 gap-4">
    <div className="w-full sm:w-auto">
      <label className="text-black font-medium flex flex-col sm:flex-row sm:items-center gap-2">
        <span>Search:</span>
        <input
          type="search"
          className="border border-gray-400 rounded px-3 py-2 w-full sm:w-auto min-w-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
      </label>
    </div>
  </div>

  {/* Table */}
  <div className="overflow-x-auto -mx-2 sm:mx-0">
    <table
      ref={tableRef}
      className={`min-w-full border-collapse border border-gray-400 text-xs sm:text-sm ${className}`}
    >
      <thead>
        <tr className="bg-[#002e4d] text-white font-semibold">
          {columns.map((column, index) => (
            <th
              key={index}
              className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-left cursor-pointer whitespace-nowrap"
              onClick={() => column.sortable !== false && handleSort(column.key)}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{column.title}</span>
                {column.sortable !== false && (
                  <span className="text-xs ml-1 flex-shrink-0">
                    {sortConfig.key === column.key ? (
                      sortConfig.direction === 'asc' ? (
                        <span className="text-white">↑<span className="text-gray-400">↓</span></span>
                      ) : (
                        <span className="text-gray-400">↑<span className="text-white">↓</span></span>
                      )
                    ) : (
                      <span className="text-gray-400">↑↓</span>
                    )}
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan={columns.length} className="text-center p-4">Loading...</td>
          </tr>
        ) : paginatedData.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center p-4">No data available</td>
          </tr>
        ) : (
          paginatedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-[#D9E8FB] border border-blue-400 hover:bg-blue-50">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 border-gray-300 border text-black"
                >
                  {column.render
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
  <div className='flex flex-col justify-between items-center mt-4 md:flex-row'>
     {/* Bottom Controls */}
  <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap order-2  md:order-1">
    {/* Export Button */}
    {onExportExcel && (
      <button
        className="flex items-center gap-2 px-4 py-2 shadow-lg shadow-gray-300 border border-green-300 rounded-md font-medium text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
        onClick={onExportExcel}
      >
        <img src="image/excel.png" alt="Export to Excel" className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline">Export to Excel</span>
        <span className="sm:hidden">Export</span>
      </button>
    )}

   
  </div>
  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-end items-center sm:items-center mt-3 order-1 md:order-2">
      {/* Showing Entries */}
      <span className="text-gray-700 text-xs sm:text-sm">
        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
      </span>

      {/* Pagination */}
      {totalPages >= 1 && (
        <div className="flex gap-1 sm:gap-2 flex-wrap justify-center sm:justify-start overflow-x-auto">
          {renderPagination()}
        </div>
      )}
    </div>
 
  </div>
 
</div>

  );
};

export default DataTable;
