
// backend/src/routes/admin-overrides.ts
import { Router } from "express";
import { adminDb } from "@/core/firebase";
import { requireRole } from "@/middleware/rbac.middleware";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";

const router = Router();

// Note: In a real system, the audit log function would be more robust.
// For now, we'll just log to the console.
const logAudit = (log: any) => {
    console.log("AUDIT_LOG:", JSON.stringify(log, null, 2));
};

/**
 * POST /admin/overrides
 * Body: { type, entityId, newStatus, reason }
 */
router.post(
  "/",
  requireRole("SuperAdmin"),
  async (req: AuthenticatedRequest, res) => {
    try {
        const { type, entityId, newStatus, reason } = req.body;
        const user = req.user!;

        if (!type || !entityId || !newStatus) {
        return res.status(400).json({ error: "Missing required fields" });
        }

        const collection =
        type === "project" ? "projects"
        : type === "payout" ? "payouts"
        : type === "fallback_kyc" ? "fallbackKycRequests"
        : null;

        if (!collection) {
        return res.status(400).json({ error: "Unsupported type" });
        }

        const ref = adminDb.collection(collection).doc(entityId);
        const snap = await ref.get();

        if (!snap.exists) {
        return res.status(404).json({ error: "Entity not found" });
        }

        const before = snap.data();

        await ref.set(
        {
            status: newStatus,
            override: {
            by: user.id,
            role: user.role,
            reason,
            at: new Date(),
            },
        },
        { merge: true }
        );

        await logAudit({
            action: "SUPERADMIN_OVERRIDE",
            actorUid: user.id,
            actorRole: user.role,
            actorEmail: user.email,
            targetCollection: collection,
            targetId: entityId,
            targetDisplay: entityId,
            before,
            after: { ...before, status: newStatus },
            success: true,
        });

        res.json({ success: true, newStatus });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;
