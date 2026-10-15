'use client';

import React from 'react';
import { Download } from 'lucide-react';
import Button from './Button';

/**
 * Shared ExportButton component for exporting Excel/Data across CNC-ERP modules.
 * Standardized with comfortable padding, rounded-xl, prominent font, and elegant theme.
 *
 * @param {string} variant - 'soft' (default, harmonious next to primary buttons) or 'solid' (full emerald fill)
 */
export default function ExportButton({
  children = 'Xuất Excel',
  onClick,
  size = 'md',
  variant = 'soft',
  className = '',
  disabled = false,
  isLoading = false,
  icon = Download,
  ...props
}) {
  const chosenVariant = variant === 'solid' ? 'success' : 'soft-success';

  return (
    <Button
      variant={chosenVariant}
      size={size}
      icon={icon}
      onClick={onClick}
      disabled={disabled}
      isLoading={isLoading}
      className={`font-semibold transition-all ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}
