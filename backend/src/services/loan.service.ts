import mongoose, { Types } from 'mongoose';
import { Loan, ILoan } from '../models/Loan.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { calculateLoanDetails } from '../utils/loanCalculations.js';
import { LOAN_STATUS, LOAN_RULES, LoanStatus } from '../constants/loan.constants.js';

export class LoanService {
  public static async createApplication(
    borrowerId: string,
    principal: number,
    tenureDays: number,
    salarySlipUrl: string
  ): Promise<ILoan> {
    if (principal < LOAN_RULES.MIN_AMOUNT || principal > LOAN_RULES.MAX_AMOUNT) {
      throw new Error(
        `Loan amount must be between ₹${LOAN_RULES.MIN_AMOUNT} and ₹${LOAN_RULES.MAX_AMOUNT}`
      );
    }

    if (tenureDays < LOAN_RULES.MIN_TENURE_DAYS || tenureDays > LOAN_RULES.MAX_TENURE_DAYS) {
      throw new Error(
        `Tenure must be between ${LOAN_RULES.MIN_TENURE_DAYS} and ${LOAN_RULES.MAX_TENURE_DAYS} days`
      );
    }

    // Prevent duplicate active applications
    const activeLoan = await Loan.findOne({
      borrowerId,
      status: { $in: [LOAN_STATUS.APPLIED, LOAN_STATUS.SANCTIONED, LOAN_STATUS.DISBURSED] },
    });

    if (activeLoan) {
      throw new Error('You already have an active or pending loan application');
    }

    const { interestAmount, totalRepayment, interestRate } = calculateLoanDetails(
      principal,
      tenureDays
    );

    const loan = await Loan.create({
      borrowerId: new Types.ObjectId(borrowerId),
      principal,
      tenureDays,
      interestRate,
      interestAmount,
      totalRepayment,
      paidAmount: 0,
      outstandingBalance: totalRepayment,
      status: LOAN_STATUS.APPLIED,
      salarySlipUrl,
      appliedAt: new Date(),
    });

    await AuditLog.create({
      loanId: loan._id,
      fromStatus: 'NONE',
      toStatus: LOAN_STATUS.APPLIED,
      changedBy: new Types.ObjectId(borrowerId),
      metadata: { principal, tenureDays, totalRepayment },
    });

    return loan;
  }

  public static async sanctionLoan(
    loanId: string,
    executiveId: string,
    decision: 'APPROVE' | 'REJECT',
    rejectionReason?: string
  ): Promise<ILoan> {
    const loan = await Loan.findById(loanId);
    if (!loan) throw new Error('Loan application not found');

    if (loan.status !== LOAN_STATUS.APPLIED) {
      throw new Error(`Cannot sanction a loan that is in ${loan.status} status`);
    }

    const fromStatus = loan.status;

    if (decision === 'APPROVE') {
      loan.status = LOAN_STATUS.SANCTIONED;
      loan.sanctionedAt = new Date();
      loan.sanctionedBy = new Types.ObjectId(executiveId);
    } else {
      if (!rejectionReason) throw new Error('Rejection reason is required');
      loan.status = LOAN_STATUS.REJECTED;
      loan.rejectionReason = rejectionReason;
      loan.rejectedBy = new Types.ObjectId(executiveId);
    }

    await loan.save();

    await AuditLog.create({
      loanId: loan._id,
      fromStatus,
      toStatus: loan.status,
      changedBy: new Types.ObjectId(executiveId),
      reason: rejectionReason,
    });

    return loan;
  }

  public static async disburseLoan(loanId: string, executiveId: string): Promise<ILoan> {
    const loan = await Loan.findById(loanId);
    if (!loan) throw new Error('Loan application not found');

    if (loan.status !== LOAN_STATUS.SANCTIONED) {
      throw new Error('Only SANCTIONED loans can be marked as DISBURSED');
    }

    const fromStatus = loan.status;
    loan.status = LOAN_STATUS.DISBURSED;
    loan.disbursedAt = new Date();
    loan.disbursedBy = new Types.ObjectId(executiveId);

    await loan.save();

    await AuditLog.create({
      loanId: loan._id,
      fromStatus,
      toStatus: LOAN_STATUS.DISBURSED,
      changedBy: new Types.ObjectId(executiveId),
    });

    return loan;
  }
}