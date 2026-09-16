'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { ErrorBanner } from '@/components/error-banner';
import { Loader2, ArrowRight, User as UserIcon, CreditCard, Calendar, IndianRupee, Briefcase } from 'lucide-react';

interface Step2DetailsProps {
  onNext: () => void;
}

export function Step2Details({ onNext }: Step2DetailsProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    pan: '',
    dateOfBirth: '',
    monthlySalary: '',
    employmentMode: 'Salaried' as 'Salaried' | 'Self-Employed' | 'Unemployed',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const response = await api.post('/borrower/personal-details', {
        fullName: formData.fullName.trim(),
        pan: formData.pan.trim().toUpperCase(),
        dateOfBirth: formData.dateOfBirth,
        monthlySalary: Number(formData.monthlySalary),
        employmentMode: formData.employmentMode,
      });

      if (response.data.success) {
        onNext();
      }
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.error?.reasons) {
        setErrors(err.response.data.error.reasons);
      } else if (err.response?.data?.message) {
        setErrors([err.response.data.message]);
      } else {
        setErrors(['Verification failed. Ensure your backend is running at http://localhost:5000']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Personal & Financial Eligibility</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Our real-time Business Rule Engine (BRE) verifies credit parameters instantly
        </p>
      </div>

      {/* BRE Inline Error Presentation */}
      {errors.length > 0 && <ErrorBanner errors={errors} />}

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Full Legal Name (as per PAN Card) *</span>
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Ramesh Chandra Sharma"
            className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* PAN Number */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>PAN Number *</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">ABCDE1234F</span>
          </div>
          <input
            type="text"
            required
            maxLength={10}
            value={formData.pan}
            onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
            placeholder="ABCDE1234F"
            className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 tracking-wider transition-all"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date of Birth *</span>
            </label>
            <span className="text-[10px] text-slate-400">Age 23 - 50</span>
          </div>
          <input
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Monthly Salary */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
              <span>Monthly In-Hand Salary (₹) *</span>
            </label>
            <span className="text-[10px] text-slate-400">Min. ₹25,000</span>
          </div>
          <input
            type="number"
            required
            min="0"
            value={formData.monthlySalary}
            onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
            placeholder="e.g. 65000"
            className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Employment Mode */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Employment Mode *</span>
          </label>
          <select
            value={formData.employmentMode}
            onChange={(e) =>
              setFormData({
                ...formData,
                employmentMode: e.target.value as 'Salaried' | 'Self-Employed' | 'Unemployed',
              })
            }
            className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="Salaried">Salaried (Eligible)</option>
            <option value="Self-Employed">Self-Employed (Eligible)</option>
            <option value="Unemployed">Unemployed (Ineligible)</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying BRE Rules...</span>
            </>
          ) : (
            <>
              <span>Validate & Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
