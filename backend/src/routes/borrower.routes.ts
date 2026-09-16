import { Router } from 'express';
import {
  BorrowerController,
  personalDetailsSchema,
  applyLoanSchema,
} from '../controllers/borrower.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { uploadSalarySlip } from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/roles.constants.js';

const router = Router();

// Live calculation slider preview is public or borrower-accessible
router.get('/calculate-preview', BorrowerController.calculatePreview);

// Guard all subsequent routes to BORROWER role only (Admin can view)
router.use(authenticate, authorize([ROLES.BORROWER]));

// Step 2: Details + BRE Engine
router.post(
  '/personal-details',
  validateRequest(personalDetailsSchema),
  BorrowerController.submitPersonalDetails
);

// Step 3: Salary slip upload (PDF/JPG/PNG max 5MB)
router.post('/upload-salary-slip', uploadSalarySlip, BorrowerController.uploadSalarySlip);

// Step 4: Loan config & apply
router.post('/apply', validateRequest(applyLoanSchema), BorrowerController.applyForLoan);

// Borrower's loan history
router.get('/my-loans', BorrowerController.getMyLoans);

export default router;