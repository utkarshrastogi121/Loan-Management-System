"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loan, ApiResponse, User } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LoanStatusBadge } from "@/components/loan-status-badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Loan[]>>(
        "/dashboard/sanction/queue",
      );
      if (response.data.success) {
        setLoans(response.data.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch sanction queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await api.patch<ApiResponse<Loan>>(
        `/loans/${id}/sanction`,
        {
          decision: "APPROVE",
        },
      );
      if (response.data.success) {
        toast({
          title: "Application Sanctioned",
          description: "Loan approved successfully",
        });
        fetchLoans();
      }
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.response?.data?.message || "Failed to sanction loan",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedLoanId(id);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedLoanId || !rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please enter a clear reason",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(selectedLoanId);
    setRejectModalOpen(false);
    try {
      const response = await api.patch<ApiResponse<Loan>>(
        `/loans/${selectedLoanId}/sanction`,
        {
          decision: "REJECT",
          rejectionReason: rejectionReason.trim(),
        },
      );
      if (response.data.success) {
        toast({
          title: "Application Rejected",
          description: "Loan has been rejected",
        });
        fetchLoans();
      }
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.response?.data?.message || "Failed to reject loan",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const borrowerName =
      typeof loan.borrower === "object" && loan.borrower
        ? (loan.borrower as User).name
        : "";
    const borrowerEmail =
      typeof loan.borrower === "object" && loan.borrower
        ? (loan.borrower as User).email
        : "";
    return (
      borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sanction Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Credit underwriting queue for applications in APPLIED status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchLoans}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
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
              placeholder="Search applications by borrower..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>{filteredLoans.length} Pending Review</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-5">LOAN ID</th>
                <th className="py-3 px-5">BORROWER</th>
                <th className="py-3 px-5">TERMS</th>
                <th className="py-3 px-5">SALARY SLIP</th>
                <th className="py-3 px-5">APPLIED DATE</th>
                <th className="py-3 px-5">STATUS</th>
                <th className="py-3 px-5 text-right">DECISION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <LoadingSpinner message="Loading underwriting queue..." />
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    <FileCheck2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No applications waiting in sanction queue.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const borrower =
                    typeof loan.borrower === "object" && loan.borrower
                      ? (loan.borrower as User)
                      : null;
                  const isProcessing = processingId === loan._id;

                  return (
                    <tr
                      key={loan._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-5 font-mono text-slate-500 font-semibold">
                        #{loan._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs border border-blue-100 shadow-sm">
                            {borrower
                              ? borrower.name.charAt(0).toUpperCase()
                              : "B"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {borrower ? borrower.name : "Borrower"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {borrower ? borrower.email : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(loan.principal)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {loan.tenureDays} Days • 12% p.a.
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        {loan.salarySlipUrl ? (
                          <a
                            href={loan.salarySlipUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Salary Proof</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            Not Uploaded
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-medium">
                        {loan.createdAt
                          ? formatDate(loan.createdAt)
                          : "Recently"}
                      </td>
                      <td className="py-3.5 px-5">
                        <LoanStatusBadge status={loan.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(loan._id)}
                            className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => openRejectModal(loan._id)}
                            className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Reject Application
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provide an official credit reason for declining this
              borrower&apos;s loan request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-4">
            <label className="text-xs font-semibold text-slate-700">
              Rejection Reason
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Inadequate monthly debt-to-income ratio or unverifiable salary slip document."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-sm shadow-rose-500/20 transition-all"
            >
              Confirm Rejection
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
