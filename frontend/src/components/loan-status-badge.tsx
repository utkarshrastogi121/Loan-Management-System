import React from 'react';
import { cn } from '@/lib/utils';

interface LoanStatusBadgeProps {
  status: 'APPLIED' | 'SANCTIONED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';
  className?: string;
}

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'SANCTIONED':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'DISBURSED':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getBadgeStyle(status),
        className
      )}
    >
      {status}
    </span>
  );
}
