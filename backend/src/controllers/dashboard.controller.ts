import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model.js';
import { Loan } from '../models/Loan.model.js';
import { Payment } from '../models/Payment.model.js';
import { ROLES } from '../constants/roles.constants.js';
import { LOAN_STATUS } from '../constants/loan.constants.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class DashboardController {
  // Sales Module: Pre-application leads (Registered users with no applied loans)
  public static async getSalesLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const borrowersWithLoans = await Loan.distinct('borrowerId');
      const leads = await User.find({
        role: ROLES.BORROWER,
        _id: { $nin: borrowersWithLoans },
      }).select('-passwordHash').sort({ createdAt: -1 });

      sendSuccess(res, 'Sales leads fetched successfully', leads);
    } catch (error) {
      next(error);
    }
  }

  // Sanction Module: Loans with status APPLIED
  public static async getSanctionQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const applications = await Loan.find({ status: LOAN_STATUS.APPLIED })
        .populate('borrowerId', 'name email personalDetails')
        .sort({ appliedAt: 1 });

      sendSuccess(res, 'Sanction queue fetched successfully', applications);
    } catch (error) {
      next(error);
    }
  }

  // Disbursement Module: Loans with status SANCTIONED
  public static async getDisbursementQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sanctionedLoans = await Loan.find({ status: LOAN_STATUS.SANCTIONED })
        .populate('borrowerId', 'name email personalDetails')
        .sort({ sanctionedAt: 1 });

      sendSuccess(res, 'Disbursement queue fetched successfully', sanctionedLoans);
    } catch (error) {
      next(error);
    }
  }

  // Collection Module: DISBURSED and CLOSED loans with repayment status
  public static async getCollectionLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loans = await Loan.find({
        status: { $in: [LOAN_STATUS.DISBURSED, LOAN_STATUS.CLOSED] },
      })
        .populate('borrowerId', 'name email personalDetails')
        .sort({ disbursedAt: -1 });

      sendSuccess(res, 'Collection accounts fetched successfully', loans);
    } catch (error) {
      next(error);
    }
  }
}