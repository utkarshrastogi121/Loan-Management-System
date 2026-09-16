import { Router } from 'express';
import {
  PaymentController,
  recordPaymentSchema,
} from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { ROLES } from '../constants/roles.constants.js';

const router = Router();

router.use(authenticate);

// Collection executive logs repayment with unique UTR
router.post(
  '/',
  authorize([ROLES.COLLECTION]),
  validateRequest(recordPaymentSchema),
  PaymentController.collectPayment
);

// Fetch repayment ledger for a loan
router.get(
  '/loan/:loanId',
  authorize([ROLES.COLLECTION, ROLES.BORROWER]),
  PaymentController.getLoanPayments
);

export default router;