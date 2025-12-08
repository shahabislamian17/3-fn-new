// backend/src/controllers/admin-fallback-kyc.controller.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { adminDb } from "@/core/firebase";

// Note: In a real system, the audit log function would be more robust.
// For now, we'll just log to the console.
const logAudit = (log: any) => {
    console.log("AUDIT_LOG:", JSON.stringify(log, null, 2));
};

export const getPendingFallbackKyc = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const snap = await adminDb
            .collection("fallbackKycRequests")
            .where("status", "==", "pending")
            .orderBy("createdAt", "asc")
            .limit(50)
            .get();

        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        res.json(items);
    } catch (err) {
        next(err);
    }
};

export const decideFallbackKyc = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { decision, reason } = req.body as {
            decision: "approved" | "rejected";
            reason?: string;
        };
        const actor = req.user!;

        const ref = adminDb.collection("fallbackKycRequests").doc(id);
        const snap = await ref.get();

        if (!snap.exists) {
            return res.status(404).json({ error: "Not found" });
        }
        const data = snap.data()!;
        const userId = data.userId;

        const update = {
            status: decision,
            reviewerUid: actor.id,
            reviewerEmail: actor.email ?? null,
            reviewReason: reason ?? null,
            updatedAt: new Date(),
        };

        await ref.set(update, { merge: true });

        // Update user payout-block fields
        const userRef = adminDb.collection("users").doc(userId);
        await userRef.set(
            {
                fallbackKycStatus: decision,
                payoutBlocked: decision !== "approved",
            },
            { merge: true }
        );

        await logAudit({
            action: "FALLBACK_KYC_REVIEWED",
            actorUid: actor.id,
            actorRole: actor.role ?? null,
            actorEmail: actor.email ?? null,
            targetCollection: "fallbackKycRequests",
            targetId: id,
            targetDisplay: `Fallback KYC review`,
            before: data,
            after: { ...data, ...update },
            success: true,
            correlationId: null,
            metadata: {
                decision,
                reason,
            },
        });

        res.json({ id, ...data, ...update });
    } catch (err) {
        next(err);
    }
};
