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
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-4",
        className
      )}
    >
      <Loader2
        className={cn(
          "w-8 h-8 text-blue-500 animate-spin",
          iconClassName
        )}
      />

      {message && (
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}