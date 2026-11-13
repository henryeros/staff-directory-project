"use client";

import React, { useEffect, useMemo, useState } from "react";
import SharedTable from "@/components/shared/table";
import { ChevronRight } from "react-feather";
import EmptyPage from "@/components/emptyPage";
import ViewResourceModal from "@/modals/viewResourceModal";
import StatusBadge from "@/components/shared/statusBadge";

/**
 * Types expected by parent/table UI
 */
export type ResourceData = {
  id: number;
  name: string;
  category: string;
  brand: string;
  serialNo: string;
  status: "Available" | "Assigned";
  assignedTo: string;
  ram?: string;
  operatingSystem?: string;
  processor?: string;
  storage?: string;
  purchase?: string;
  condition?: string;
};

export interface ResourceTableProps {
  searchQuery: string;
  data: ResourceData[];
  onRefresh: () => void;
  loading?: boolean;
  error?: string;
}

/**
 * tiny helper to guarantee no empty strings in UI
 */
function safe(val: any, fallback = "N/A") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string" && val.trim() === "") return fallback;
  return String(val);
}

export default function ResourcesTable({ 
  searchQuery, 
  data, 
  onRefresh, 
  loading = false, 
  error = "" 
}: ResourceTableProps) {
  // server pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // modal state
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [selectedResource, setSelectedResource] = useState<ResourceData | null>(null);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // open view modal
  const handleViewDetails = (resource: ResourceData) => {
    setSelectedResource(resource);
    setOpenViewModal(true);
  };

  console.log(selectedResource, 'selectedResource');

  // inline "View" action button
  const ActionButton = ({ resource }: { resource: ResourceData }) => (
    <button
      className="flex items-center gap-1 text-[#182230] hover:opacity-70 cursor-pointer transition-opacity duration-200"
      onClick={() => handleViewDetails(resource)}
      disabled={loading}
    >
      <span>View</span>
      <ChevronRight size={16} />
    </button>
  );

  // decorate rows for table (badge, action button, etc.)
  const tableData = useMemo(
    () =>
      paginatedData.map((item, index) => ({
        ...item,
        // Calculate serial number based on current page
        id: (currentPage - 1) * pageSize + index + 1,
        status: (
          <StatusBadge status={item.status} variant="resources" />
        ),
        assignedTo: item.assignedTo === "N/A" ? "N/A" : item.assignedTo,
        action: <ActionButton resource={item} />,
      })),
    [paginatedData, currentPage, pageSize, loading]
  );

  // table headers
  const columns = [
    { key: "id", header: "S/N" },
    { key: "name", header: "Item Name" },
    { key: "category", header: "Category" },
    { key: "serialNo", header: "Serial No/IMEI" },
    { key: "status", header: "Status" },
    { key: "assignedTo", header: "Assigned to" },
    { key: "action", header: "Action" },
  ];

  // Refresh handler
  const handleRefresh = () => {
    onRefresh();
  };

  // early loading state
  if (loading && data.length === 0) {
    return (
      <div className="py-10 text-center text-[#475467]">
        Loading resources...
      </div>
    );
  }

  return (
    <div>
      {/* View details modal */}
      <ViewResourceModal
        isOpen={openViewModal}
        onClose={() => setOpenViewModal(false)}
        resourceId={selectedResource?.id}
        // resourceData={selectedResource}
      />

      {/* Error display */}
      {error && (
        <div className="mb-4 rounded-md border border-[#FEE4E2] bg-[#FEF3F2] p-4 text-sm text-[#B42318]">
          {error}
        </div>
      )}

      {/* Refresh button */}
      {/* <div className="flex justify-end mb-4">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 text-sm bg-[#F9FAFB] border border-[#D0D5DD] rounded-md hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div> */}

      {/* Empty state vs table */}
      {data.length === 0 && !loading ? (
        <EmptyPage
          header={searchQuery ? "No resources match your search criteria. Try adjusting your search terms." : "Get started by adding your first resource to the inventory."}

          buttonText="Add New Resource"
          onClick={handleRefresh}
          showButton={!searchQuery}
        />
      ) : (
        <SharedTable
          columns={columns}
          data={tableData}
          currentPage={currentPage}
          pageSize={pageSize}
          totalResults={data.length}
          onPageChange={setCurrentPage}
          // loading={loading}
        />
      )}
    </div>
  );
}