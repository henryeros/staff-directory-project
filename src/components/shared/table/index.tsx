import React from "react";

interface Column {
  key: string;
  header: string;
}

interface TableProps {
  columns: Column[];
  data: Record<string, React.ReactNode>[];
  currentPage: number;
  pageSize: number;
  totalResults: any;
  onPageChange: (page: number) => void;
}

export default function SharedTable({
  columns,
  data,
  currentPage,
  pageSize,
  totalResults,
  onPageChange,
}: TableProps) {
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const startResult = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults);

  const WINDOW_SIZE = 3;

  function getPageNumbers(): Array<number | "ellipsis"> {
    if (totalPages <= WINDOW_SIZE + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: Array<number | "ellipsis"> = [];
    const firstPage = 1;
    const lastPage = totalPages;

    const half = Math.floor(WINDOW_SIZE / 2);

    let windowStart = currentPage - half;
    let windowEnd = currentPage + half;

    if (windowStart < 2) {
      windowStart = 2;
      windowEnd = windowStart + WINDOW_SIZE - 1;
    }

    if (windowEnd > lastPage - 1) {
      windowEnd = lastPage - 1;
      windowStart = windowEnd - WINDOW_SIZE + 1;
      if (windowStart < 2) {
        windowStart = 2;
      }
    }

    pages.push(firstPage);

    if (windowStart > 2) {
      pages.push("ellipsis");
    }

    for (let p = windowStart; p <= windowEnd; p++) {
      pages.push(p);
    }

    if (windowEnd < lastPage - 1) {
      pages.push("ellipsis");
    }

    pages.push(lastPage);

    return pages;
  }

  const pageItems = getPageNumbers();

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-b border-r border-l border-[#EAECF0] rounded-[12px]">
          <thead>
            <tr className="bg-[#EAECF0] rounded-[12px]">
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-base font-medium text-[#182230] ${
                    index === 0 ? "rounded-l-[12px]" : ""
                  } ${index === columns.length - 1 ? "rounded-r-[12px]" : ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 &&
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    rowIndex % 2 === 1 ? "bg-[#F2F4F7]" : "bg-[#FFFFFF]"
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-base font-normal text-[#182230]"
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-6 text-center text-[#475467]"
                >
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-row items-center justify-between mt-4">
        <div className="flex items-center rounded">
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-disabled={currentPage === 1}
            className="w-8 h-8 flex items-center rounded-l justify-center bg-[#F2F4F7] border-[0.5px] border-[#D0D5DD] disabled:opacity-50"
          >
            <span className="text-[12px] font-normal text-[#182230]">&lt;</span>
          </button>

          {pageItems.map((item, idx) => {
            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center border-[0.5px] border-[#D0D5DD] text-[12px] font-normal text-[#182230] bg-transparent select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = item as number;
            const isActive = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 flex items-center cursor-pointer justify-center border-[0.5px] border-[#D0D5DD] text-[12px] font-normal text-[#182230] ${
                  isActive ? "bg-[#EAECF0]" : "bg-transparent"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            aria-disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center bg-[#F2F4F7] rounded-r border-[0.5px] border-[#D0D5DD] disabled:opacity-50"
          >
            <span className="text-[12px] font-normal text-[#182230]">&gt;</span>
          </button>
        </div>

        <div className="text-base font-normal text-[#344054]">
          Showing {startResult}-{endResult} of {totalResults} results
        </div>
      </div>
    </div>
  );
}