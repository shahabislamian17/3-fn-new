// backend/src/controllers/admin-kyc.controller.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { adminDb } from "@/core/firebase";
// Note: In a real system, the audit log function would be more robust.
// For now, we'll just log to the console.
const logAudit = (log: any) => {
    console.log("AUDIT_LOG:", JSON.stringify(log, null, 2));
};

export const setKycStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { status, reason } = req.body as {
            status: "pending" | "passed" | "failed";
            reason?: string;
        };

        if (!["pending", "passed", "failed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const docRef = adminDb.collection("users").doc(userId);
        const snap = await docRef.get();
        const before = snap.exists ? snap.data() : null;

        await docRef.set(
            {
                kycStatus: status,
                kycReviewedAt: new Date().toISOString(),
                kycReviewedBy: req.user?.id ?? null,
                kycReviewReason: reason ?? null,
            },
            { merge: true }
        );

        const afterSnap = await docRef.get();
        const after = afterSnap.data() || null;

        await logAudit({
            action: "KYC_STATUS_CHANGED",
            actorUid: req.user?.id ?? null,
            actorRole: req.user?.role ?? null,
            actorEmail: req.user?.email ?? null,
            targetCollection: "users",
            targetId: userId,
            targetDisplay: after?.email ?? null,
            before,
            after,
            success: true,
            correlationId: null,
            metadata: { reason },
        });

        res.json({ ok: true, status });
    } catch (err) {
        next(err);
    }
};
