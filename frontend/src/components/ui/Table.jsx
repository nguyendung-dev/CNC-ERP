'use client';

import React, { useState, useEffect } from 'react';
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
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset to page 1 if data length shrinks
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-sm">Đang tải dữ liệu từ máy chủ...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <Inbox className="w-8 h-8 text-slate-300" />
        <span className="text-sm">{emptyMessage}</span>
      </div>
    );
  }

  const paginatedData = enablePagination
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedData.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition hover:bg-slate-50/70 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`py-3 px-4 text-slate-700 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row, (currentPage - 1) * pageSize + rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {enablePagination && data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={data.length}
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
