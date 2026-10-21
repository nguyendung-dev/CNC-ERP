'use client';

import React from 'react';
import Dropdown from './Dropdown';

export function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition disabled:bg-slate-100 disabled:opacity-75 ${
          error ? 'border-rose-400 focus:ring-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

// Modern, sleek Dropdown exported as Select for backwards compatibility across all modules
export function Select(props) {
  return <Dropdown {...props} />;
}

export { Dropdown };
