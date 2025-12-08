// backend/src/routes/admin-kyc.routes.ts
import { Router } from "express";
import { setKycStatus } from "@/controllers/admin-kyc.controller";
import { requireRole } from "@/middleware/rbac.middleware";

const router = Router();

/**
 * PATCH /admin/users/:userId/kyc
 * Body: { status: "passed"|"failed", reason?: string }
 */
router.patch(
  "/users/:userId/kyc",
  requireRole("Admin"), // Or a more specific 'ComplianceOfficer' role
  setKycStatus
);

export default router;
