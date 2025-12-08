
// backend/src/routes/compliance-summary.ts
import { Router } from "express";
import { adminDb } from "@/core/firebase";
import { requireRole } from "@/middleware/rbac.middleware";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";

const router = Router();

/**
 * GET /admin/compliance-summary
 */
router.get(
  "/",
  requireRole("Admin", "SuperAdmin", "ComplianceOfficer"),
  async (req: AuthenticatedRequest, res) => {
    try {
        // Count KYC stats
        const kycPassed = await adminDb.collection("users").where("kycStatus", "==", "passed").get();
        const kycFailed = await adminDb.collection("users").where("kycStatus", "==", "failed").get();
        const kycPending = await adminDb.collection("users").where("kycStatus", "==", "pending").get();

        // Risk tiers
        const low = await adminDb.collection("users").where("riskTier", "==", "low").get();
        const medium = await adminDb.collection("users").where("riskTier", "==", "medium").get();
        const high = await adminDb.collection("users").where("riskTier", "==", "high").get();

        // Escalations
        const escalations = await adminDb
        .collection("autoApprovalDecisions")
        .where("decision", "==", "escalate")
        .get();

        const rejected = await adminDb
        .collection("autoApprovalDecisions")
        .where("decision", "==", "reject")
        .get();

        const summary = {
        kyc: {
            passed: kycPassed.size,
            failed: kycFailed.size,
            pending: kycPending.size,
        },
        risk: {
            low: low.size,
            medium: medium.size,
            high: high.size,
        },
        escalations: escalations.size,
        rejected: rejected.size,
        updatedAt: new Date(),
        };

        res.json(summary);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;
