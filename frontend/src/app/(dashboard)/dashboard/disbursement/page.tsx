'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loan, ApiResponse, User } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LoanStatusBadge } from '@/components/loan-status-badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import {
  Banknote,
  CheckCircle2,
  Search,
  RefreshCw,
  ArrowUpRight,
  Wallet,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Loan[]>>('/dashboard/disbursement/queue');
      if (response.data.success) {
        setLoans(response.data.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch disbursement queue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setConfirmModalOpen(true);
  };

  const handleDisburse = async () => {
    if (!selectedLoan) return;
    setProcessingId(selectedLoan._id);
    setConfirmModalOpen(false);

    try {
      const response = await api.patch<ApiResponse<Loan>>(`/loans/${selectedLoan._id}/disburse`);
      if (response.data.success) {
        toast({
          title: 'Funds Disbursed',
          description: `Successfully released ${formatCurrency(selectedLoan.principal)} to borrower account.`,
        });
        fetchLoans();
      }
    } catch (error: any) {
      toast({
        title: 'Disbursement Failed',
        description: error.response?.data?.message || 'Treasury payout execution failed',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredLoans = loans.filter((loan: any) => {
    const borrowerObj =
      typeof loan.borrowerId === 'object'
        ? loan.borrowerId
        : typeof loan.borrower === 'object'
        ? loan.borrower
        : null;

    const borrowerName =
      borrowerObj?.personalDetails?.fullName || borrowerObj?.name || '';
    const borrowerEmail = borrowerObj?.email || '';

    return (
      borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalSanctionedVolume = loans.reduce((acc, l) => acc + (l.principal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Disbursement Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">Treasury liquidity release for SANCTIONED approved loans</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-blue-600" />
            <span>Pending Payouts: {formatCurrency(totalSanctionedVolume)}</span>
          </div>

          <button
            type="button"
            onClick={fetchLoans}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sanctioned loans by borrower..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{filteredLoans.length} Ready for Disbursal</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-5">LOAN ID</th>
                <th className="py-3 px-5">BORROWER</th>
                <th className="py-3 px-5">SANCTIONED PRINCIPAL</th>
                <th className="py-3 px-5">TENURE & INTEREST</th>
                <th className="py-3 px-5">TOTAL DUE</th>
                <th className="py-3 px-5">STATUS</th>
                <th className="py-3 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <LoadingSpinner message="Loading treasury queue..." />
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <Banknote className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No loans currently waiting for treasury payout.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan: any) => {
                  const borrowerObj =
                    typeof loan.borrowerId === 'object'
                      ? loan.borrowerId
                      : typeof loan.borrower === 'object'
                      ? loan.borrower
                      : null;

                  const displayName =
                    borrowerObj?.personalDetails?.fullName ||
                    borrowerObj?.name ||
                    'Borrower';
                  const displayEmail = borrowerObj?.email || '';
                  const initialLetter = displayName.charAt(0).toUpperCase();
                  const isProcessing = processingId === loan._id;

                  return (
                    <tr key={loan._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3.5 px-5 font-mono text-slate-500 font-semibold">
                        #{loan._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs border border-blue-100 shadow-sm">
                            {initialLetter}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{displayName}</span>
                            <span className="text-[10px] text-slate-400">{displayEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 text-sm">{formatCurrency(loan.principal)}</span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">
                        <div>{loan.tenureDays} Days @ 12% p.a.</div>
                        <div className="text-[10px] text-slate-400">SI: {formatCurrency(loan.simpleInterest)}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-blue-600">{formatCurrency(loan.totalRepayment)}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <LoanStatusBadge status={loan.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => openConfirmModal(loan)}
                          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-sm shadow-blue-500/20"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>Release Payout</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Banknote className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">Authorize Treasury Release</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              You are authorizing direct treasury fund disbursement to the borrower account.
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="bg-slate-50 rounded-xl p-4 my-4 space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Disbursement Amount:</span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(selectedLoan.principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenure:</span>
                <span className="font-semibold text-slate-700">{selectedLoan.tenureDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Repayment Expected:</span>
                <span className="font-bold text-blue-600">{formatCurrency(selectedLoan.totalRepayment)}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setConfirmModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDisburse}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
            >
              Confirm Disbursal
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}