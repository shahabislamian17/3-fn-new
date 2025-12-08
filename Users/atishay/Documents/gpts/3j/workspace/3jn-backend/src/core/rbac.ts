
import type { User, UserRole } from "./types";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  // Base roles
  Investor: 1,
  ProjectOwner: 1,
  // Staff roles
  Support: 2,
  AccountingOperator: 2,
  ComplianceOfficer: 3,
  // Admin roles
  Admin: 4,
  SuperAdmin: 5,
};

/**
 * Checks if a user has at least the required role.
 * Example: An 'Admin' (level 4) has the permissions of a 'ComplianceOfficer' (level 3).
 * @param user The user object, which must have a `role` property.
 * @param requiredRole The minimum role required for the action.
 * @returns `true` if the user has the required role or higher, otherwise `false`.
 */
export function hasRole(
  user: { role?: UserRole | null } | null,
  requiredRole: UserRole
): boolean {
  if (!user?.role) return false;
  const userLevel = ROLE_HIERARCHY[user.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 99; // Default to a high number for safety
  return userLevel >= requiredLevel;
}
