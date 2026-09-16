'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loan, ApiResponse, User, PaymentResponse } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LoanStatusBadge } from '@/components/loan-status-badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import {
  Receipt,
  Search,
  RefreshCw,
  CreditCard,
  Hash,
  Calendar,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    utr: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Loan[]>>('/dashboard/collection/loans');
      if (response.data.success) {
        setLoans(response.data.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch collection portfolio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setPaymentForm({
      utr: `UTR${Date.now()}`,
      amount: loan.totalRepayment ? String(loan.totalRepayment) : '',
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    if (!paymentForm.utr.trim() || !paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast({ title: 'Invalid Payment Data', description: 'Please enter a valid UTR number and amount', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post<ApiResponse<PaymentResponse>>('/payments', {
        loanId: selectedLoan._id,
        utr: paymentForm.utr.trim(),
        amount: Number(paymentForm.amount),
        paymentDate: paymentForm.paymentDate ? new Date(paymentForm.paymentDate).toISOString() : undefined,
      });

      if (response.data.success) {
        toast({
          title: 'Repayment Logged',
          description: `UTR ${paymentForm.utr} registered. Status: ${response.data.data?.loanStatus || 'Updated'}`,
        });
        setPaymentModalOpen(false);
        fetchLoans();
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.response?.data?.message || error.response?.data?.error?.reasons?.join(', ') || 'Failed to record payment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLoans = loans.filter((loan: any) => {
    const borrowerObj = typeof loan.borrowerId === 'object' ? loan.borrowerId : typeof loan.borrower === 'object' ? loan.borrower : null;
    const borrowerName = borrowerObj?.personalDetails?.fullName || borrowerObj?.name || '';
    const borrowerEmail = borrowerObj?.email || '';
    return (
      borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPortfolioDue = loans.reduce((acc, l) => acc + (l.totalRepayment || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Collection & Recovery</h1>
          <p className="text-xs text-slate-500 mt-0.5">Monitor repayments, log bank UTR settlements, and track closure</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-2">
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Expected: {formatCurrency(totalPortfolioDue)}</span>
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
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search portfolio by borrower..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>{filteredLoans.length} Loans in Portfolio</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-5">LOAN ID</th>
                <th className="py-3 px-5">BORROWER</th>
                <th className="py-3 px-5">DISBURSED PRINCIPAL</th>
                <th className="py-3 px-5">TOTAL REPAYMENT</th>
                <th className="py-3 px-5">STATUS</th>
                <th className="py-3 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <LoadingSpinner message="Loading collection records..." />
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No disbursed or closed loans in the collection queue.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan: any) => {
                  const borrowerObj = typeof loan.borrowerId === 'object' ? loan.borrowerId : typeof loan.borrower === 'object' ? loan.borrower : null;
                  const displayName = borrowerObj?.personalDetails?.fullName || borrowerObj?.name || 'Borrower';
                  const displayEmail = borrowerObj?.email || '';
                  const initialLetter = displayName.charAt(0).toUpperCase();
                  const isClosed = loan.status === 'CLOSED';

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
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {formatCurrency(loan.principal)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-blue-600 text-sm">{formatCurrency(loan.totalRepayment)}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <LoanStatusBadge status={loan.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {isClosed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Fully Settled</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openPaymentModal(loan)}
                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-sm shadow-blue-500/20"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Log Settlement</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Settlement Modal Dialog */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <CreditCard className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">Log Repayment Settlement</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Record a unique bank UTR number. When repayment reaches total due, loan status automatically closes.
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4 my-2">
              <div className="bg-slate-50 rounded-xl p-3 text-xs border border-slate-100 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Loan Total Repayment Due:</span>
                <span className="font-bold text-blue-600 text-sm">{formatCurrency(selectedLoan.totalRepayment)}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span>Unique Bank UTR Number *</span>
                </label>
                <input
                  type="text"
                  required
                  value={paymentForm.utr}
                  onChange={(e) => setPaymentForm({ ...paymentForm, utr: e.target.value })}
                  placeholder="e.g. UTR928471928471"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                  <span>Repayment Amount (₹) *</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="e.g. 106000"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payment Date</span>
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
                >
                  {submitting ? 'Recording...' : 'Register Settlement'}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
