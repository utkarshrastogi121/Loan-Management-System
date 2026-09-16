import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
  className?: string;
  iconClassName?: string;
}

export function LoadingSpinner({
  message,
  fullPage = false,
  className,
  iconClassName,
}: LoadingSpinnerProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-2.5 p-4", className)}>
      <Loader2 className={cn("w-7 h-7 text-blue-600 animate-spin", iconClassName)} />
      {message && <p className="text-xs font-semibold text-slate-500 animate-pulse">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
}
