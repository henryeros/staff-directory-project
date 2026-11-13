'use client'
import React, { useState, useMemo } from 'react';
import SharedTable from '@/components/shared/table';
import { ChevronRight } from 'react-feather';
import EmptyPage from '@/components/emptyPage';
import ViewEmployeeModal from '@/modals/viewEmployeeModal';
import StatusBadge from '@/components/shared/statusBadge';
import { formatIOSDateToDMY } from '@/utils/helper';

interface EmployeeData {
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

interface EmployeeTableProps {
  data: any;
  departmentEmployees?: boolean; // make this a boolean flag instead of any
}

export default function EmployeeTable({ data, departmentEmployees }: EmployeeTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // how many rows to show per page in the UI
  const pageSize = 10;

  const [openViewModal, setViewModal] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

  const viewDetails = (employee: EmployeeData): void => {
    setSelectedEmployee(employee);
    setViewModal(true);
  };

  const ActionButton = ({ employee }: { employee: EmployeeData }) => (
    <button
      className="flex items-center gap-1 text-[#182230] hover:opacity-70 cursor-pointer"
      onClick={() => viewDetails(employee)}
    >
      <span>View Details</span>
      <ChevronRight size={16} />
    </button>
  );

  // 1. Decorate the raw data with UI components (badge, formatted date, etc.)
  const decoratedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      startDate: <>{formatIOSDateToDMY(item.startDate)}</>,
      status: <StatusBadge status={item.status} />,
      action: <ActionButton employee={item} />,
    }));
  }, [data]);

  // 2. Slice based on current page (client-side pagination core)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return decoratedData.slice(startIndex, endIndex);
  }, [decoratedData, currentPage]);

  // 3. Columns (full vs condensed for department view)
  const fullColumns = [
    { key: 'sn', header: 'S/N' },
    { key: 'fullName', header: 'Full Name' },
    { key: 'jobTitle', header: 'Job Title' },
    { key: 'department', header: 'Department' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'status', header: 'Status' },
    { key: 'action', header: 'Action' },
  ];

  const departmentColumns = [
    { key: 'sn', header: 'S/N' },
    { key: 'fullName', header: 'Full Name' },
    { key: 'jobTitle', header: 'Job Title' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'action', header: 'Action' },
  ];

  const columnsToUse = departmentEmployees ? departmentColumns : fullColumns;

  const totalResults = data.length; // for footer "Showing x-y of z results"

  return (
    <div>
      {/* View modal */}
      <ViewEmployeeModal
        isOpen={openViewModal}
        onClose={() => setViewModal(false)}
        employeeData={selectedEmployee}
      />

      {/* Empty state */}
      {data.length === 0 ? (
        <EmptyPage
          header="No Employees added"
          buttonText="Add New Employee"
          onClick={() => {}}
        />
      ) : (
        <SharedTable
          columns={columnsToUse}
          data={paginatedData}
          currentPage={currentPage}
          pageSize={pageSize}
          totalResults={totalResults}
          onPageChange={(page) => {
            // guard: stay in range, also scroll to top of table if you want
            setCurrentPage(page);
          }}
        />
      )}
    </div>
  );
}