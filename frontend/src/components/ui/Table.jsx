'use client';

import React, { useState } from 'react';
import { Loader2, Inbox } from 'lucide-react';
import Pagination from './Pagination';

export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'Chưa có dữ liệu nào',
  onRowClick,
  enablePagination = true,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  minWidth = 'min-w-[1050px]',
  className = '',
}) {
  const safeData = Array.isArray(data)
    ? data
    : (data?.data && Array.isArray(data.data) ? data.data : []);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Derived safe page: ensures current page never exceeds max pages without triggering extra re-renders
  const totalPages = Math.max(1, Math.ceil(safeData.length / pageSize) || 1);
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  // Only show full loader if there is no data yet
  if (isLoading && (!safeData || safeData.length === 0)) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-sm">Đang tải dữ liệu từ máy chủ...</span>
      </div>
    );
  }

  if (!safeData || safeData.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <Inbox className="w-8 h-8 text-slate-300" />
        <span className="text-sm">{emptyMessage}</span>
      </div>
    );
  }

  const paginatedData = enablePagination
    ? safeData.slice((safePage - 1) * pageSize, safePage * pageSize)
    : safeData;

  return (
    <div className={`rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs ${className}`}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className={`w-full text-left border-collapse text-sm ${minWidth}`}>
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 whitespace-nowrap ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedData.map((row, rowIdx) => (
              <tr
                key={row?.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors hover:bg-slate-50/80 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-3.5 px-4 text-slate-700 ${col.wrap ? '' : 'whitespace-nowrap'} ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row, (safePage - 1) * pageSize + rowIdx) : row?.[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {enablePagination && safeData.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalItems={safeData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}
