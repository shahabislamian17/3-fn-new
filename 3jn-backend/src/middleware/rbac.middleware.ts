
// backend/src/middleware/rbac.middleware.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { UserRole } from "@/core/types";
import { hasRole as checkRole } from "@/core/rbac";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: user not found in request" });
    }
    
    if (!user.role || !allowedRoles.some(role => checkRole(user, role))) {
      return res.status(403).json({
        error: "Forbidden: insufficient permissions",
        requiredRoles: allowedRoles,
        yourRole: user.role,
      });
    }
    next();
  };
};
