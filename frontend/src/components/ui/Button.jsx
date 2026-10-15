'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-2 rounded-xl',
    md: 'text-sm px-4.5 py-2.5 gap-2 rounded-xl shadow-xs',
    lg: 'text-base px-5 py-3 gap-2.5 rounded-xl shadow-sm',
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs focus:ring-blue-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-300',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300 focus:ring-slate-300 bg-white',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
