import { Schema, model, Document, Types } from 'mongoose';
import { LOAN_STATUS, LoanStatus } from '../constants/loan.constants.js';

export interface ILoan extends Document {
  _id: Types.ObjectId;
  borrowerId: Types.ObjectId;
  principal: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  paidAmount: number;
  outstandingBalance: number;
  status: LoanStatus;
  salarySlipUrl: string;
  appliedAt: Date;
  sanctionedAt?: Date;
  sanctionedBy?: Types.ObjectId;
  disbursedAt?: Date;
  disbursedBy?: Types.ObjectId;
  closedAt?: Date;
  rejectionReason?: string;
  rejectedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    principal: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, required: true, default: 12 },
    interestAmount: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    paidAmount: { type: Number, default: 0, min: 0 },
    outstandingBalance: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(LOAN_STATUS),
      default: LOAN_STATUS.APPLIED,
      index: true,
      required: true,
    },
    salarySlipUrl: { type: String, required: true },
    appliedAt: { type: Date, default: Date.now },
    sanctionedAt: { type: Date },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disbursedAt: { type: Date },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date },
    rejectionReason: { type: String },
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Loan = model<ILoan>('Loan', LoanSchema);