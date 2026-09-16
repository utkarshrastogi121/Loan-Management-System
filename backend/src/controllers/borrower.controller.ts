import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { User } from '../models/User.model.js';
import { Loan } from '../models/Loan.model.js';
import { BREService } from '../services/bre.service.js';
import { LoanService } from '../services/loan.service.js';
import { calculateLoanDetails } from '../utils/loanCalculations.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const personalDetailsSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    pan: z.string().length(10),
    dateOfBirth: z.string(),
    monthlySalary: z.number().positive(),
    employmentMode: z.enum(['Salaried', 'Self-Employed', 'Unemployed']),
  }),
});

export const applyLoanSchema = z.object({
  body: z.object({
    principal: z.number().min(50000).max(500000),
    tenureDays: z.number().min(30).max(365),
    salarySlipUrl: z.string().min(1, 'Salary slip reference is required'),
  }),
});

export class BorrowerController {
  // Step 2: Personal Details + BRE Verification
  public static async submitPersonalDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } = req.body;

      // Run Business Rule Engine (BRE)
      const breEvaluation = BREService.evaluate({
        fullName,
        pan,
        dateOfBirth,
        monthlySalary,
        employmentMode,
      });

      // Persist state onto User document
      await User.findByIdAndUpdate(userId, {
        personalDetails: {
          fullName,
          pan: pan.toUpperCase(),
          dateOfBirth: new Date(dateOfBirth),
          monthlySalary,
          employmentMode,
          isEligible: breEvaluation.isEligible,
          rejectionReason: breEvaluation.reasons.join(', '),
        },
      });

      if (!breEvaluation.isEligible) {
        sendError(
          res,
          'Eligibility criteria not met. Loan application blocked.',
          { reasons: breEvaluation.reasons },
          422
        );
        return;
      }

      sendSuccess(res, 'BRE verification passed successfully. You may proceed to document upload.', {
        eligible: true,
      });
    } catch (error) {
      next(error);
    }
  }

  // Step 3: Salary slip file upload
  public static async uploadSalarySlip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'No file uploaded. Please upload a PDF, JPG, or PNG under 5MB.', null, 400);
        return;
      }

      const secureUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      const userId = req.user!.userId;

      await User.findByIdAndUpdate(userId, {
        'personalDetails.salarySlipUrl': secureUrl,
      });

      sendSuccess(res, 'Salary slip uploaded successfully', { fileUrl: secureUrl });
    } catch (error: any) {
      console.error('Cloudinary Upload Error Details:', error);
      next(error);
    }
  }

  // Live calculation endpoint for client-side sliders
  public static calculatePreview(req: Request, res: Response): void {
    const principal = Number(req.query.principal) || 50000;
    const tenureDays = Number(req.query.tenureDays) || 30;
    const breakdown = calculateLoanDetails(principal, tenureDays);
    sendSuccess(res, 'Calculation breakdown', breakdown);
  }

  // Step 4: Loan Config & Apply
  public static async applyForLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { principal, tenureDays, salarySlipUrl } = req.body;

      const user = await User.findById(userId);
      if (!user || !user.personalDetails?.isEligible) {
        sendError(res, 'You must successfully pass BRE verification before applying for a loan', null, 400);
        return;
      }

      const loan = await LoanService.createApplication(userId, principal, tenureDays, salarySlipUrl);
      sendSuccess(res, 'Loan application submitted successfully', loan, 201);
    } catch (error: any) {
      next(error);
    }
  }

  // Borrower: Check current loan status
  public static async getMyLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const loans = await Loan.find({ borrowerId: userId }).sort({ createdAt: -1 });
      sendSuccess(res, 'Borrower loans fetched', loans);
    } catch (error) {
      next(error);
    }
  }
}