'use client'
import React, { useState, useMemo } from 'react';
import SharedTable from '@/components/shared/table';
import { ChevronRight } from 'react-feather';
import EmptyPage from '@/components/emptyPage';
import ViewEmployeeModal from '@/modals/viewEmployeeModal';
import StatusBadge from '@/components/shared/statusBadge';
import { formatIOSDateToDMY } from '@/utils/helper';

interface HireData {
  sn: number;
  fullName: string;
  jobTitle: string;
  department: string;
  startDate: string;
  status: 'Active' | 'Inactive';
  sex: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  branch: string;
  employmentType: string;
  salary: string;
  address: string;
  emergencyContact: string;
}

interface HireTableProps {
  data: any;
  loading?: boolean;
}

export default function HireTable({ 
  data, 
  loading = false 
}: HireTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  
  const [openViewModal, setViewModel] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<HireData | null>(null);

  // Calculate paginated data for client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Calculate total pages and results
  const totalResults = data.length;
  const totalPages = Math.ceil(totalResults / pageSize);

  const viewDetails = (employee: HireData): void => {
    setSelectedEmployee(employee);
    setViewModel(true);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const ActionButton = ({ employee }: { employee: HireData }) => (
    <button 
      className="flex items-center gap-1 text-[#182230] hover:opacity-70 cursor-pointer transition-opacity duration-200" 
      onClick={() => viewDetails(employee)}
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
      sn: startIndex + index + 1, // Calculate S/N based on current page
      startDate: <div>{formatIOSDateToDMY(item.startDate)}</div>,
      status: <StatusBadge status={item.status} />,
      action: <ActionButton employee={item} />,
    }));
  }, [paginatedData, currentPage, pageSize, loading]);

  const columns = [
    { key: 'sn', header: 'S/N' },
    { key: 'fullName', header: 'Full Name' },
    { key: 'jobTitle', header: 'Job Title' },
    { key: 'department', header: 'Department' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'status', header: 'Status' },
    { key: 'action', header: 'Action' },
  ];

  // Show loading state
  if (loading && data.length === 0) {
    return (
      <div className="py-10 text-center text-[#475467]">
        Loading employees...
      </div>
    );
  }

  return (
    <div>
      <ViewEmployeeModal 
        isOpen={openViewModal} 
        onClose={() => setViewModel(false)}
        employeeData={selectedEmployee}
      />
      
      {data.length === 0 && !loading ? (
        <EmptyPage
          header="No new hires added"
       
          buttonText="Add New Employee"
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