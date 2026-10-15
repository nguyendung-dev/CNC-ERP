'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination Component
 *
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalItems - Total number of items
 * @param {number} pageSize - Number of items per page
 * @param {function} onPageChange - Callback when user clicks a page (pageNumber)
 * @param {function} onPageSizeChange - Optional callback when user changes page size
 * @param {Array} pageSizeOptions - Available page size options (e.g. [5, 10, 20, 50])
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 5,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers array (with smart ellipsis if many pages)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-white select-none text-xs text-slate-500">
      {/* Left: Summary text */}
      <div className="flex items-center gap-2">
        <span>
          Hiển thị <strong className="text-slate-800 font-semibold">{startItem}</strong> -{' '}
          <strong className="text-slate-800 font-semibold">{endItem}</strong> trong tổng số{' '}
          <strong className="text-slate-800 font-semibold">{totalItems}</strong> bản ghi
        </span>

        {/* Optional Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-400">|</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="py-1 px-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => safeCurrentPage > 1 && onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 border transition ${
            safeCurrentPage <= 1
              ? 'text-slate-300 border-slate-200 bg-slate-50/50 cursor-not-allowed'
              : 'text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer'
          }`}
          title="Trang trước"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400">
                  ...
                </span>
              );
            }

            const isActive = p === safeCurrentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => safeCurrentPage < totalPages && onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 border transition ${
            safeCurrentPage >= totalPages
              ? 'text-slate-300 border-slate-200 bg-slate-50/50 cursor-not-allowed'
              : 'text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer'
          }`}
          title="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
