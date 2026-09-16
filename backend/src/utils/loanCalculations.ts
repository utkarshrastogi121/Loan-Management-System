import { LOAN_RULES } from '../constants/loan.constants.js';

export interface LoanBreakdown {
  principal: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
}

export const calculateLoanDetails = (
  principal: number,
  tenureDays: number,
  interestRate = LOAN_RULES.ANNUAL_INTEREST_RATE
): LoanBreakdown => {
  // SI = (P * R * T) / (365 * 100)
  const exactInterest = (principal * interestRate * tenureDays) / (365 * 100);
  const interestAmount = Math.round(exactInterest * 100) / 100;
  const totalRepayment = Math.round((principal + interestAmount) * 100) / 100;

  return {
    principal,
    tenureDays,
    interestRate,
    interestAmount,
    totalRepayment,
  };
};