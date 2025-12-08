// backend/src/routes/admin-auto-approval.routes.ts
import { Router } from "express";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { requireRole } from "@/middleware/rbac.middleware";
import { adminDb } from "@/core/firebase";
import { callAutoApprovalEngine } from "@/lib/ai-auto-approval";
import { AutoApprovalInput, ApprovalType, AutoApprovalDecision } from "@/types/auto-approval";

const router = Router();

// Note: In a real system, the audit log function would be more robust.
// For now, we'll just log to the console.
const logAudit = (log: any) => {
    console.log("AUDIT_LOG:", JSON.stringify(log, null, 2));
};


/**
 * POST /admin/auto-approval/evaluate
 * Body: { type, userId, entityId }
 * Fetches user + entity, calls AI, returns decision (no side effects).
 */
router.post(
  "/evaluate",
  requireRole("Admin"), // admin/superadmin/compliance
  async (req: AuthenticatedRequest, res) => {
    try {
      const { type, userId, entityId } = req.body as {
        type: ApprovalType;
        userId: string;
        entityId: string;
      };

      // Load user
      const userSnap = await adminDb.collection("users").doc(userId).get();
      if (!userSnap.exists) return res.status(404).json({ error: "User not found" });
      const userData = userSnap.data() as any;

      // Load entity based on type
      let entityRef: FirebaseFirestore.DocumentReference;
      switch (type) {
        case "project":
          entityRef = adminDb.collection("projects").doc(entityId);
          break;
        case "payout":
          entityRef = adminDb.collection("payouts").doc(entityId);
          break;
        case "kyc":
          entityRef = adminDb.collection("kycProfiles").doc(entityId);
          break;
        case "fallback_kyc":
          entityRef = adminDb.collection("fallbackKycRequests").doc(entityId);
          break;
        default:
          return res.status(400).json({ error: "Unsupported type" });
      }

      const entitySnap = await entityRef.get();
      if (!entitySnap.exists) return res.status(404).json({ error: "Entity not found" });

      const entityData = entitySnap.data() as any;

      const input: AutoApprovalInput = {
        type,
        user: {
          id: userId,
          role: userData.role ?? "investor",
          riskScore: userData.riskScore ?? 0,
          riskTier: userData.riskTier ?? "low",
          riskFlags: userData.riskFlags ?? [],
          kycStatus: userData.kycStatus ?? "not_started",
          fallbackKycStatus: userData.fallbackKycStatus ?? "not_required",
          payoutBlocked: !!userData.payoutBlocked,
          countryRiskTier: userData.countryRiskTier ?? "tier2",
        },
        entity: {
          id: entityId,
          type,
          fields: entityData,
        },
      };

      const decision: AutoApprovalDecision = await callAutoApprovalEngine(input);

      // Do NOT change DB here – this route is only for evaluation
      res.json({ input, decision });
    } catch (err: any) {
      console.error("auto-approval evaluate error", err);
      res.status(500).json({ error: "Internal error" });
    }
  }
);


// GET /admin/auto-approval/stats
router.get(
    "/stats",
    requireRole("Admin"),
    async (_req: AuthenticatedRequest, res) => {
      const today = new Date();
      const since = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
      const snap = await adminDb
        .collection("autoApprovalDecisions")
        .where("createdAt", ">=", since)
        .get();
  
      let approved = 0;
      let rejected = 0;
      let escalated = 0;
  
      snap.forEach((doc) => {
        const d = doc.data() as any;
        if (d.decision === "approve") approved++;
        else if (d.decision === "reject") rejected++;
        else if (d.decision === "escalate") escalated++;
      });
  
      res.json({
        approved,
        rejected,
        escalated,
        total: approved + rejected + escalated,
        since,
      });
    }
  );
  
  // GET /admin/auto-approval/history
  router.get(
    "/history",
    requireRole("Admin"),
    async (_req: AuthenticatedRequest, res) => {
      const snap = await adminDb
        .collection("autoApprovalDecisions")
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
  
      const items = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
  
      res.json(items);
    }
  );

export default router;
