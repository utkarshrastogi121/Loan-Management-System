import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { ROLES } from '../constants/roles.constants.js';

const router = Router();

router.use(authenticate);

// Sales Module (Leads)
router.get(
  '/sales/leads',
  authorize([ROLES.SALES]),
  DashboardController.getSalesLeads
);

// Sanction Module (Applications queue)
router.get(
  '/sanction/queue',
  authorize([ROLES.SANCTION]),
  DashboardController.getSanctionQueue
);

// Disbursement Module (Approved queue)
router.get(
  '/disbursement/queue',
  authorize([ROLES.DISBURSEMENT]),
  DashboardController.getDisbursementQueue
);

// Collection Module (Active & closed portfolios)
router.get(
  '/collection/loans',
  authorize([ROLES.COLLECTION]),
  DashboardController.getCollectionLoans
);

export default router;