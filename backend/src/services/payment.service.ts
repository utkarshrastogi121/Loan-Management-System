import mongoose, { Types } from 'mongoose';
import { Loan } from '../models/Loan.model.js';
import { Payment, IPayment } from '../models/Payment.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { LOAN_STATUS } from '../constants/loan.constants.js';

export class PaymentService {
  public static async recordPayment(
    loanId: string,
    executiveId: string,
    utr: string,
    amount: number,
    paymentDate?: Date
  ): Promise<{ payment: IPayment; loanStatus: string; outstandingBalance: number }> {
    const cleanUtr = utr.trim().toUpperCase();

    // 1. Verify UTR uniqueness
    const existingUtr = await Payment.findOne({ utr: cleanUtr });
    if (existingUtr) {
      throw new Error(`UTR ${cleanUtr} has already been recorded for another payment`);
    }

    // 2. Fetch active loan
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status !== LOAN_STATUS.DISBURSED) {
      throw new Error(`Payments can only be collected for DISBURSED loans (Current status: ${loan.status})`);
    }

    if (amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    if (amount > loan.outstandingBalance) {
      throw new Error(
        `Payment amount (₹${amount}) exceeds outstanding balance (₹${loan.outstandingBalance})`
      );
    }

    // 3. Create payment ledger entry
    const payment = await Payment.create({
      loanId: loan._id,
      borrowerId: loan.borrowerId,
      utr: cleanUtr,
      amount,
      paymentDate: paymentDate || new Date(),
      recordedBy: new Types.ObjectId(executiveId),
    });

    // 4. Update balances
    const newPaidAmount = Math.round((loan.paidAmount + amount) * 100) / 100;
    const newOutstanding = Math.max(0, Math.round((loan.totalRepayment - newPaidAmount) * 100) / 100);

    loan.paidAmount = newPaidAmount;
    loan.outstandingBalance = newOutstanding;

    // 5. Auto-close condition: When total amount paid equals total repayment
    if (newOutstanding === 0) {
      const fromStatus = loan.status;
      loan.status = LOAN_STATUS.CLOSED;
      loan.closedAt = new Date();

      await AuditLog.create({
        loanId: loan._id,
        fromStatus,
        toStatus: LOAN_STATUS.CLOSED,
        changedBy: new Types.ObjectId(executiveId),
        reason: 'Auto-closed upon full repayment settlement',
        metadata: { finalUtr: cleanUtr, totalRepaid: newPaidAmount },
      });
    }

    await loan.save();

    return {
      payment,
      loanStatus: loan.status,
      outstandingBalance: loan.outstandingBalance,
    };
  }
}