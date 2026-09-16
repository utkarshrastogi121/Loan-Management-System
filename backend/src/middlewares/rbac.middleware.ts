import { Request, Response, NextFunction } from 'express';
import { ROLES, UserRole } from '../constants/roles.constants.js';
import { sendError } from '../utils/apiResponse.js';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthenticated request', null, 401);
      return;
    }

    // ADMIN always has full system clearance across all modules
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Forbidden: Role '${req.user.role}' lacks permission to access this resource`,
        null,
        403
      );
      return;
    }

    next();
  };
};