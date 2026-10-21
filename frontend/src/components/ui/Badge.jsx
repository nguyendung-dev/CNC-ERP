'use client';

import React from 'react';

export const STATUS_LABELS = {
  // Báo giá (Quotations)
  draft: 'Bản nháp',
  sent: 'Đã gửi khách',
  approved: 'Đã phê duyệt',
  converted_to_so: 'Đã chuyển thành SO',
  rejected: 'Từ chối',

  // Đơn hàng (Sales Orders)
  in_production: 'Đang sản xuất',
  partially_delivered: 'Giao hàng 1 phần',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',

  // Lệnh sản xuất (Production Orders) & Máy móc CNC
  running: 'Đang gia công',
  finished: 'Hoàn thành',
  pending: 'Chờ xử lý',
  paused: 'Tạm dừng',
  idle: 'Chờ việc',
  maintenance: 'Bảo trì',

  // Gia công ngoài (Subcontracting)
  processing: 'Đang gia công ngoài',
  received: 'Đã nhận về',

  // Tài chính & Công nợ (Finance & Debts)
  paid: 'Đã thanh toán',
  unpaid: 'Chưa thanh toán',
  partially_paid: 'Thanh toán 1 phần',
  overdue: 'Quá hạn',
  receivable: 'Phải thu',
  payable: 'Phải trả',

  // QC / Kiểm tra chất lượng
  passed: 'Đạt chuẩn (OK)',
  failed: 'Không đạt (NG)',
  rework: 'Gia công lại',

  // Kho vật tư & Tồn kho
  in_stock: 'Còn hàng',
  low_stock: 'Dưới định mức',
  out_of_stock: 'Hết hàng',

  // Tài khoản & Người dùng
  active: 'Đang hoạt động',
  inactive: 'Tạm khóa',
};

export const getStatusLabel = (status) => {
  if (!status) return '';
  return STATUS_LABELS[status] || status;
};

const statusStyles = {
  // Thành công / Xanh lá
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  finished: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  passed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // Đang tiến hành / Xanh dương - Tím
  running: 'bg-blue-50 text-blue-700 border-blue-200',
  in_production: 'bg-blue-50 text-blue-700 border-blue-200',
  sent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  converted_to_so: 'bg-violet-50 text-violet-700 border-violet-200',
  received: 'bg-teal-50 text-teal-700 border-teal-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',

  // Cảnh báo / Chờ duyệt / Vàng cam
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  partially_delivered: 'bg-amber-50 text-amber-700 border-amber-200',
  partially_paid: 'bg-amber-50 text-amber-700 border-amber-200',
  low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
  idle: 'bg-amber-50 text-amber-700 border-amber-200',
  rework: 'bg-amber-50 text-amber-700 border-amber-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',

  // Nguy hiểm / Quá hạn / Thất bại / Đỏ
  unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  out_of_stock: 'bg-rose-50 text-rose-700 border-rose-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',

  // Trung tính / Nháp / Xám
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  maintenance: 'bg-orange-50 text-orange-700 border-orange-200',
  paused: 'bg-slate-100 text-slate-700 border-slate-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

const dotColors = {
  approved: 'bg-emerald-500',
  completed: 'bg-emerald-500',
  finished: 'bg-emerald-500',
  paid: 'bg-emerald-500',
  passed: 'bg-emerald-500',
  in_stock: 'bg-emerald-500',
  active: 'bg-emerald-500',
  success: 'bg-emerald-500',

  running: 'bg-blue-500',
  in_production: 'bg-blue-500',
  sent: 'bg-indigo-500',
  converted_to_so: 'bg-violet-500',
  received: 'bg-teal-500',
  processing: 'bg-blue-500',
  info: 'bg-blue-500',

  pending: 'bg-amber-500',
  partially_delivered: 'bg-amber-500',
  partially_paid: 'bg-amber-500',
  low_stock: 'bg-amber-500',
  idle: 'bg-amber-500',
  rework: 'bg-amber-500',
  warning: 'bg-amber-500',

  unpaid: 'bg-rose-500',
  rejected: 'bg-rose-500',
  cancelled: 'bg-rose-500',
  failed: 'bg-rose-500',
  overdue: 'bg-rose-500',
  out_of_stock: 'bg-rose-500',
  danger: 'bg-rose-500',

  draft: 'bg-slate-400',
  inactive: 'bg-slate-400',
  maintenance: 'bg-orange-500',
  paused: 'bg-slate-400',
  neutral: 'bg-slate-400',
};

export default function Badge({ children, variant = 'neutral', status, showDot = true, className = '' }) {
  const statusKey = status || (typeof children === 'string' ? children : null);
  const chosenStyle = (statusKey && statusStyles[statusKey]) || statusStyles[variant] || statusStyles.neutral;
  const chosenDot = (statusKey && dotColors[statusKey]) || dotColors[variant] || dotColors.neutral;

  // Determine display label: If children is standard status key, translate it automatically
  let content = children;
  if (typeof children === 'string' && STATUS_LABELS[children]) {
    content = STATUS_LABELS[children];
  } else if (!children && status && STATUS_LABELS[status]) {
    content = STATUS_LABELS[status];
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${chosenStyle} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${chosenDot}`} />
      )}
      {content}
    </span>
  );
}
