// backend/src/routes/admin-fallback-kyc.ts
import { Router } from "express";
import { getPendingFallbackKyc, decideFallbackKyc } from "@/controllers/admin-fallback-kyc.controller";
import { requireRole } from "@/middleware/rbac.middleware";

const router = Router();

router.get(
  "/pending",
  requireRole("Admin"), // Or ComplianceOfficer
  getPendingFallbackKyc
);

router.post(
  "/:id/decision",
  requireRole("Admin"), // Or ComplianceOfficer
  decideFallbackKyc
);

export default router;
