'use client';

import React from 'react';
import { Download } from 'lucide-react';
import Button from './Button';

/**
 * Shared ExportButton component for exporting Excel/Data across CNC-ERP modules.
 * Standardized with comfortable padding, rounded-xl, prominent font, and emerald theme.
 */
export default function ExportButton({
  children = 'Xuất Báo Cáo Excel (XLSX)',
  onClick,
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  icon = Download,
  ...props
}) {
  return (
    <Button
      variant="success"
      size={size}
      icon={icon}
      onClick={onClick}
      disabled={disabled}
      isLoading={isLoading}
      className={`font-semibold shadow-xs hover:shadow transition-all ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}
