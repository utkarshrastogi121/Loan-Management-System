'use client';

import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import api from '@/lib/api';
import { formatCurrency, calculateSI, calculateTotal } from '@/lib/utils';
import {
  IndianRupee,
  Calendar,
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Percent,
} from 'lucide-react';
import Link from 'next/link';

interface Step4LoanProps {
  salarySlipUrl: string;
}

const INTEREST_RATE = 12; // 12% p.a.

export function Step4Loan({ salarySlipUrl }: Step4LoanProps) {
  const [principal, setPrincipal] = useState([100000]); // 50k to 500k
  const [tenure, setTenure] = useState([180]); // 30 to 365
  const [loading, setLoading] = useState(false);
  const [submittedLoan, setSubmittedLoan] = useState<any | null>(null);
  const [error, setError] = useState('');

  const p = principal[0];
  const t = tenure[0];
  const si = calculateSI(p, t, INTEREST_RATE);
  const total = calculateTotal(p, t, INTEREST_RATE);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/borrower/apply', {
        principal: p,
        tenureDays: t,
        salarySlipUrl: salarySlipUrl || 'https://storage.googleapis.com/salary-slip-placeholder.pdf',
      });

      if (response.data.success) {
        setSubmittedLoan(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Loan application submission failed');
    } finally {
      setLoading(false);
    }
  };

  // Success Celebration Screen
  if (submittedLoan) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" /> Status: APPLIED
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Transmitted!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your loan application has been forwarded to credit underwriting in the Sanction Queue.
          </p>
        </div>

        {/* Loan Summary Card */}
        <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Loan Reference:</span>
            <span className="font-mono font-bold text-slate-800">#{submittedLoan._id?.slice(-8).toUpperCase() || 'REF-83021'}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Principal Requested:</span>
            <span className="font-bold text-slate-900 text-sm">{formatCurrency(p)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Tenure:</span>
            <span className="font-semibold text-slate-700">{t} Days</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
            <span className="text-slate-500">Total Repayment Expected:</span>
            <span className="font-bold text-blue-600 text-sm">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/my-loans"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <span>View My Loans</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Configure Loan Terms</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Dual range sliders with real-time Simple Interest breakdown calculations
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Two Column Layout: Sliders Left, Breakdown Card Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Sliders Column */}
        <div className="md:col-span-7 space-y-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
          {/* Principal Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
                <span>Principal Amount</span>
              </label>
              <span className="text-base font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                {formatCurrency(p)}
              </span>
            </div>

            <Slider
              value={principal}
              onValueChange={(v) => setPrincipal(Array.isArray(v) ? [...v] : [v])}
              min={50000}
              max={500000}
              step={5000}
              className="py-2"
            />

            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>{formatCurrency(50000)}</span>
              <span>Step ₹5,000</span>
              <span>{formatCurrency(500000)}</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tenure Duration</span>
              </label>
              <span className="text-base font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                {t} Days
              </span>
            </div>

            <Slider
              value={tenure}
              onValueChange={(v) => setTenure(Array.isArray(v) ? [...v] : [v])}
              min={30}
              max={365}
              step={5}
              className="py-2"
            />

            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>30 Days</span>
              <span>Step 5 Days</span>
              <span>365 Days</span>
            </div>
          </div>
        </div>

        {/* Shopeers Blue Breakdown Card Right */}
        <div className="md:col-span-5 bg-blue-50/70 border border-blue-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-2.5">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-blue-600" />
              <span>Loan Breakdown</span>
            </span>
            <span className="text-[10px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
              Formula: P + SI
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Principal (P):</span>
              <span className="font-bold text-slate-900">{formatCurrency(p)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tenure (T):</span>
              <span className="font-semibold text-slate-800">{t} Days</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Interest Rate (R):</span>
              <span className="font-semibold text-slate-800">12.0% p.a.</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Simple Interest (SI):</span>
              <span className="font-semibold text-emerald-700 font-mono">+{formatCurrency(si)}</span>
            </div>

            <div className="border-t border-blue-200/60 pt-3 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700">Total Repayment:</span>
              <span className="text-lg font-black text-blue-600 tracking-tight">{formatCurrency(total)}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic text-center">
            SI = (P × 12 × {t}) / (365 × 100)
          </p>
        </div>
      </div>

      {/* Submit Action Button */}
      <div className="pt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-8 py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <span>Submit Loan Application</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
