import { Router } from 'express';
import authRoutes from './auth.routes.js';
import borrowerRoutes from './borrower.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import loanRoutes from './loan.routes.js';
import paymentRoutes from './payment.routes.js';

const rootRouter = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/borrower', borrowerRoutes);
rootRouter.use('/dashboard', dashboardRoutes);
rootRouter.use('/loans', loanRoutes);
rootRouter.use('/payments', paymentRoutes);

export default rootRouter;