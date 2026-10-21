'use client';

import React from 'react';

/**
 * CurrencyInput - Format thousands with dot separator automatically (1.000.000 đ)
 */
export default function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = '0',
  suffix = '₫',
  className = '',
  required = false,
  disabled = false,
  hint,
  id,
}) {
  // Format numeric value with dots: 1000000 -> 1.000.000
  const displayValue =
    value !== undefined && value !== null && value !== ''
      ? Number(value.toString().replace(/\D/g, '')).toLocaleString('vi-VN')
      : '';

  const handleChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    const numValue = rawDigits === '' ? 0 : Number(rawDigits);
    if (onChange) onChange(numValue);
  };

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor={id}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-mono font-medium text-slate-800 ${className}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
