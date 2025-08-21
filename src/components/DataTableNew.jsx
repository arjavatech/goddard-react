import React, { useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Search,
  FileDown,
  Loader2,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Database
} from 'lucide-react';

const DataTableNew = ({
  data = [],
  columns = [],
  loading = false,
  onExportExcel,
  className = "",
  title,
  description
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

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-[#0F2D52]" />
      : <ChevronDown className="h-4 w-4 text-[#0F2D52]" />;
  };

  const renderPaginationButton = (page, isActive = false, disabled = false, label = null) => (
    <Button
      key={page || label}
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => typeof page === 'number' && setCurrentPage(page)}
      disabled={disabled}
      className={`${isActive ? 'bg-[#0F2D52] hover:bg-[#0F2D52]/90' : ''} min-w-[32px]`}
    >
      {label || page}
    </Button>
  );

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      renderPaginationButton(
        currentPage - 1,
        false,
        currentPage === 1,
        <ArrowLeft className="h-4 w-4" />
      )
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPaginationButton(i, currentPage === i));
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Button key="ellipsis" variant="ghost" size="sm" disabled className="min-w-[32px]">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
      }
      pages.push(renderPaginationButton(totalPages, false));
    }

    // Next button
    pages.push(
      renderPaginationButton(
        currentPage + 1,
        false,
        currentPage === totalPages,
        <ArrowRight className="h-4 w-4" />
      )
    );

    return pages;
  };

  return (
    <Card className={`w-full ${className}`}>
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle className="flex items-center gap-2 text-[#0F2D52]">
              <Database className="h-5 w-5" />
              {title}
            </CardTitle>
          )}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent>
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {sortedData.length} {sortedData.length === 1 ? 'entry' : 'entries'}
            </Badge>
            {filteredData.length !== data.length && (
              <Badge variant="secondary" className="text-sm">
                Filtered from {data.length}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            {/* Export Button */}
            {onExportExcel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportExcel}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Export to Excel</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table ref={tableRef}>
            <TableHeader>
              <TableRow className="bg-[#0F2D52] hover:bg-[#0F2D52]">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={`text-white font-semibold ${
                      column.sortable !== false ? 'cursor-pointer select-none' : ''
                    }`}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{column.title}</span>
                      {column.sortable !== false && (
                        <div className="ml-2 flex-shrink-0">
                          {getSortIcon(column.key)}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-[#0F2D52]" />
                      <span>Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Database className="h-8 w-8 text-gray-400" />
                      <span className="text-gray-500">
                        {filteredData.length === 0 && data.length > 0
                          ? 'No results found for your search'
                          : 'No data available'
                        }
                      </span>
                      {searchTerm && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchTerm('')}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow 
                    key={rowIndex} 
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className="font-medium">
                        {column.render
                          ? column.render(row[column.key], row, rowIndex)
                          : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bottom Controls */}
        {!loading && paginatedData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of{' '}
              {sortedData.length} {sortedData.length === 1 ? 'entry' : 'entries'}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {renderPagination()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTableNew;