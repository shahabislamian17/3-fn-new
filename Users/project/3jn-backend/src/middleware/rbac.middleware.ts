import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { hasRole as checkRole, UserRole } from '@/core/rbac';

export const requireRole = (requiredRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !checkRole(req.user, requiredRole)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
