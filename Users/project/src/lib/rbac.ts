
import type { UserRole } from "./types";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  Investor: 1,
  ProjectOwner: 1,
  Support: 2,
  AccountingOperator: 2,
  ComplianceOfficer: 2,
  Admin: 3,
  SuperAdmin: 4,
};

// This function is now safe for both client and server use as it has no server-side dependencies.
export function hasRole(
  user: { role?: UserRole | null } | null,
  requiredRole: UserRole
): boolean {
  if (!user?.role) return false;
  const userLevel = ROLE_HIERARCHY[user.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 99;
  return userLevel >= requiredLevel;
}
