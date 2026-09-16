import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LoanService } from '../services/loan.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const sanctionDecisionSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid Loan ID'),
  }),
  body: z.object({
    decision: z.enum(['APPROVE', 'REJECT']),
    rejectionReason: z.string().optional(),
  }),
});

export const loanIdParamSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid Loan ID'),
  }),
});

export class LoanController {
  public static async handleSanction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { decision, rejectionReason } = req.body;
      const executiveId = req.user!.userId;

      const loan = await LoanService.sanctionLoan(id, executiveId, decision, rejectionReason);
      sendSuccess(res, `Loan application marked as ${loan.status}`, loan);
    } catch (error) {
      next(error);
    }
  }

  public static async handleDisbursement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const executiveId = req.user!.userId;

      const loan = await LoanService.disburseLoan(id, executiveId);
      sendSuccess(res, 'Loan disbursed successfully. Transferred to active collections.', loan);
    } catch (error) {
      next(error);
    }
  }
}