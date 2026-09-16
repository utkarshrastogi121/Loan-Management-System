'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Loan, ApiResponse } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LoanStatusBadge } from '@/components/loan-status-badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { RoleGuard } from '@/components/role-guard';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function MyLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const fetchMyLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Loan[]>>('/borrower/my-loans');
      if (response.data.success) {
        setLoans(response.data.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch loan history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['BORROWER']}>
      <div className="min-h-screen bg-[#F8FAFC]">

        <main className="max-w-5xl mx-auto py-10 px-4 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Loan Applications</h1>
              <p className="text-xs text-slate-500 mt-0.5">Track real-time underwriting decisions and repayment schedules</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchMyLoans}
                disabled={loading}
                className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <Link
                href="/apply"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply for New Loan</span>
              </Link>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                    <th className="py-3 px-5">LOAN REF</th>
                    <th className="py-3 px-5">PRINCIPAL</th>
                    <th className="py-3 px-5">TENURE</th>
                    <th className="py-3 px-5">TOTAL REPAYMENT</th>
                    <th className="py-3 px-5">SUBMITTED ON</th>
                    <th className="py-3 px-5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <LoadingSpinner message="Fetching your loan records..." />
                      </td>
                    </tr>
                  ) : loans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                        <p className="font-semibold text-slate-700 text-sm">No loans submitted yet</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          You haven&apos;t applied for any loans. Use our 4-step wizard to apply in minutes.
                        </p>
                        <div className="mt-4">
                          <Link
                            href="/apply"
                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-sm transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Start First Application</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    loans.map((loan) => (
                      <tr key={loan._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5 font-mono font-bold text-slate-700">
                          #{loan._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                          {formatCurrency(loan.principal)}
                        </td>
                        <td className="py-4 px-5 text-slate-600 font-medium">
                          {loan.tenureDays} Days
                        </td>
                        <td className="py-4 px-5 font-bold text-blue-600 text-sm">
                          {formatCurrency(loan.totalRepayment)}
                        </td>
                        <td className="py-4 px-5 text-slate-500 font-medium">
                          {loan.createdAt ? formatDate(loan.createdAt) : 'Recently'}
                        </td>
                        <td className="py-4 px-5">
                          <div className="space-y-1">
                            <LoanStatusBadge status={loan.status} />
                            {loan.rejectionReason && (
                              <p className="text-[10px] text-rose-600 font-medium max-w-xs">
                                Reason: {loan.rejectionReason}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
