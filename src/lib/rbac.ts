
// src/lib/rbac.ts
import { ServerUser } from "./server-auth";

export type Role =
  | "Investor"
  | "ProjectOwner"
  | "Admin"
  | "SuperAdmin"
  | "ComplianceOfficer"
  | "Support"
  | "AccountingOperator";


const ROLE_HIERARCHY: Record<Role, number> = {
  Investor: 1,
  ProjectOwner: 1,
  Support: 2,
  ComplianceOfficer: 2,
  AccountingOperator: 2,
  Admin: 3,
  SuperAdmin: 4,
};

export function hasRole(
  user: ServerUser | null,
  requiredRole: Role
): boolean {
  if (!user?.role) return false;
  const userLevel = ROLE_HIERARCHY[user.role as Role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 99; // Default to a high number for safety
  return userLevel >= requiredLevel;
}

export function requireRole(
  user: ServerUser | null,
  requiredRole: Role
) {
  if (!hasRole(user, requiredRole)) {
    throw new Error(`Forbidden: requires ${requiredRole}`);
  }
}
