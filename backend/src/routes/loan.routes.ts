import { Router } from 'express';
import {
  LoanController,
  sanctionDecisionSchema,
  loanIdParamSchema,
} from '../controllers/loan.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { ROLES } from '../constants/roles.constants.js';

const router = Router();

router.use(authenticate);

// Sanction action: APPROVE or REJECT
router.patch(
  '/:id/sanction',
  authorize([ROLES.SANCTION]),
  validateRequest(sanctionDecisionSchema),
  LoanController.handleSanction
);

// Disbursement action: release funds
router.patch(
  '/:id/disburse',
  authorize([ROLES.DISBURSEMENT]),
  validateRequest(loanIdParamSchema),
  LoanController.handleDisbursement
);

export default router;