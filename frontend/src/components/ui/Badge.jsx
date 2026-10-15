'use client';

import React from 'react';

const statusMap = {
  // Standard statuses
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',

  // Domain statuses
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  finished: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  running: 'bg-blue-50 text-blue-700 border-blue-200',
  in_production: 'bg-blue-50 text-blue-700 border-blue-200',
  converted_to_so: 'bg-violet-50 text-violet-700 border-violet-200',
  sent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  received: 'bg-cyan-50 text-cyan-700 border-cyan-200',

  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  partially_delivered: 'bg-amber-50 text-amber-700 border-amber-200',
  partially_paid: 'bg-amber-50 text-amber-700 border-amber-200',
  unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function Badge({ children, variant = 'neutral', status, className = '' }) {
  const chosenStyle = (status && statusMap[status]) || statusMap[variant] || statusMap.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${chosenStyle} ${className}`}
    >
      {children}
    </span>
  );
}
