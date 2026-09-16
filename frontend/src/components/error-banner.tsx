import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  error?: any;
  errors?: string[];
  className?: string;
}

export function ErrorBanner({ error, errors, className }: ErrorBannerProps) {
  let title = 'Eligibility Assessment: BRE Rules Not Met';
  let reasons: string[] = [];

  if (errors && Array.isArray(errors)) {
    reasons = errors;
  } else if (typeof error === 'string') {
    title = error;
  } else if (error?.response?.data) {
    const data = error.response.data;
    title = data.message || title;
    if (data.error?.reasons && Array.isArray(data.error.reasons)) {
      reasons = data.error.reasons;
    }
  } else if (error?.message) {
    title = error.message;
  }

  if (!error && (!errors || errors.length === 0)) return null;

  return (
    <div className={cn("bg-rose-50/90 border border-rose-200 rounded-2xl p-4 shadow-sm", className)}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-bold text-rose-800">{title}</h3>
          {reasons.length > 0 && (
            <ul className="mt-2 space-y-1.5 text-xs text-rose-700">
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span className="font-medium">{reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
