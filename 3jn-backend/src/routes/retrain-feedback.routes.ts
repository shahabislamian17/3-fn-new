
// backend/src/routes/retrain-feedback.ts
import { Router } from "express";
import { adminDb } from "@/core/firebase";
import { requireRole } from "@/middleware/rbac.middleware";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";

const router = Router();

/**
 * POST /admin/retrain-feedback
 */
router.post(
  "/",
  requireRole("Admin", "SuperAdmin", "ComplianceOfficer"),
  async (req: AuthenticatedRequest, res) => {
    try {
        const { type, entityId, aiDecision, humanDecision, notes } = req.body;
        const user = req.user!;

        if (!type || !entityId || !aiDecision || !humanDecision) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const doc = {
            type,
            entityId,
            aiDecision,
            humanDecision,
            notes,
            reviewerUid: user.id,
            reviewerRole: user.role,
            createdAt: new Date(),
        };

        await adminDb.collection("aiRetrainFeedback").add(doc);

        res.json({ success: true, doc });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;
