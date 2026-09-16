'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle2, User as UserIcon, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Step1AuthProps {
  onNext: () => void;
}

export function Step1Auth({ onNext }: Step1AuthProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-10 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please log in with your borrower credentials to begin or continue your loan application.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <span>Go to Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-6 space-y-6">
      {/* Icon */}
      <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Identity Verified</h2>
        <p className="text-xs text-slate-500">You are securely signed in to the borrower origin portal</p>
      </div>

      {/* User Info Card */}
      <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Applicant Name</span>
          <span className="text-xs font-bold text-slate-900">{user.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Registered Email</span>
          <span className="text-xs font-mono text-slate-700">{user.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">System Clearance</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            <ShieldCheck className="w-3 h-3" /> {user.role}
          </span>
        </div>
      </div>

      {/* Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-8 py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all"
        >
          <span>Continue to Personal Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
