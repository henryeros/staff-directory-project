'use client'
import React, { useState, useMemo } from 'react';
import SharedTable from '@/components/shared/table';
import { ChevronRight } from 'react-feather';
import EmptyPage from '@/components/emptyPage';
import ViewDepartmentModal from '@/modals/viewDepartmentModal';
import StatusBadge from '@/components/shared/statusBadge';

// Define proper Department data structure
interface DepartmentData {
  id: number;
  name: string;
  head: string;
  employeesCount: number;
  dateCreated: string;
  status?: 'Active' | 'Inactive'; // Optional if you want status
  branch?: string; // Optional if needed
}

interface DepartmentTableProps {
  data: any;
  loading?: boolean;
}

export default function DepartmentTable({ 
  data, 
  loading = false 
}: DepartmentTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  
  const [openViewModal, setViewModel] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null);

  // Calculate paginated data for client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Calculate total pages and results
  const totalResults = data.length;
  const totalPages = Math.ceil(totalResults / pageSize);

  const viewDetails = (department: DepartmentData): void => {
    setSelectedDepartment(department);
    setViewModel(true);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const ActionButton = ({ department }: { department: DepartmentData }) => (
    <button 
      className="flex items-center gap-1 text-[#182230] hover:opacity-70 cursor-pointer transition-opacity duration-200" 
      onClick={() => viewDetails(department)}
      disabled={loading}
    >
      <span>View Details</span>
      <ChevronRight size={16} />
    </button>
  );

  // Prepare table data with proper serial numbers
  const tableData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    
    return paginatedData.map((item, index) => ({
      ...item,
      id: startIndex + index + 1, // Calculate S/N based on current page
      // status: item.status ? <StatusBadge status={item.status} /> : 'N/A',
      action: <ActionButton department={item} />,
    }));
  }, [paginatedData, currentPage, pageSize, loading]);

  const columns = [
    { key: 'id', header: 'S/N' },
    { key: 'name', header: 'Department Name' },
    { key: 'head', header: 'Department Head' },
    { key: 'employeesCount', header: 'Number of employees' },
    // { key: 'dateCreated', header: 'Date Created' },
    // { key: 'status', header: 'Status' }, // Optional - remove if not needed
    { key: 'action', header: 'Action' },
  ];

  // Show loading state
  if (loading && data.length === 0) {
    return (
      <div className="py-10 text-center text-[#475467]">
        Loading departments...
      </div>
    );
  }

  return (
    <div>
      <ViewDepartmentModal
        isOpen={openViewModal} 
        onClose={() => setViewModel(false)}
        departmentData={selectedDepartment}
      />
      
      {data.length === 0 && !loading ? (
        <EmptyPage
          header="No departments added"
 
          buttonText="Add New Department"
          onClick={() => {}}
        />
      ) : (
        <div>
          {/* Results count */}
          <div className="mb-4 text-sm text-[#475467]">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalResults)} to{' '}
            {Math.min(currentPage * pageSize, totalResults)} of {totalResults} results
          </div>

          {/* Table */}
          <SharedTable
            columns={columns}
            data={tableData}
            currentPage={currentPage}
            pageSize={pageSize}
            totalResults={totalResults}
            // totalPages={totalPages}
            onPageChange={handlePageChange}
            // loading={loading}
          />
        </div>
      )}
    </div>
  );
}