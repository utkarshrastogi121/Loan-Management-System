export type UserRole = 'ADMIN' | 'SALES' | 'SANCTION' | 'DISBURSEMENT' | 'COLLECTION' | 'BORROWER';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Loan {
  _id: string;
  borrower: User | string;
  principal: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  rejectionReason?: string;
  salarySlipUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type LoanStatus = 'APPLIED' | 'SANCTIONED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';

export interface Payment {
  _id: string;
  loanId: string;
  utr: string;
  amount: number;
  paymentDate: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: { reasons?: string[] } | any;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface BREResult {
  eligible: boolean;
}

export interface PaymentResponse {
  payment: Payment;
  loanStatus: string;
  outstandingBalance: number;
}
