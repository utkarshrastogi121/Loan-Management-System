import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PaymentService } from '../services/payment.service.js';
import { Payment } from '../models/Payment.model.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const recordPaymentSchema = z.object({
  body: z.object({
    loanId: z.string().length(24, 'Invalid Loan ID'),
    utr: z.string().min(6, 'UTR must be a minimum of 6 alphanumeric characters'),
    amount: z.number().positive('Amount must be positive'),
    paymentDate: z.string().optional(),
  }),
});

export class PaymentController {
  public static async collectPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { loanId, utr, amount, paymentDate } = req.body;
      const executiveId = req.user!.userId;

      const result = await PaymentService.recordPayment(
        loanId,
        executiveId,
        utr,
        amount,
        paymentDate ? new Date(paymentDate) : undefined
      );

      sendSuccess(res, 'Payment recorded successfully', result, 201);
    } catch (error: any) {
      next(error);
    }
  }

  public static async getLoanPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { loanId } = req.params;
      const payments = await Payment.find({ loanId })
        .populate('recordedBy', 'name email')
        .sort({ paymentDate: -1 });

      sendSuccess(res, 'Payment history retrieved', payments);
    } catch (error) {
      next(error);
    }
  }
}