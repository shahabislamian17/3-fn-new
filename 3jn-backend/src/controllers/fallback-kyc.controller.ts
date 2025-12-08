// backend/src/controllers/fallback-kyc.controller.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { adminDb } from "@/core/firebase";

// Note: In a real system, the audit log function would be more robust.
// For now, we'll just log to the console.
const logAudit = (log: any) => {
    console.log("AUDIT_LOG:", JSON.stringify(log, null, 2));
};

export const getFallbackKycStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const uid = req.user!.id;

        const snap = await adminDb
            .collection("fallbackKycRequests")
            .where("userId", "==", uid)
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        if (snap.empty) {
            return res.json({ status: "none" });
        }

        const doc = snap.docs[0];
        res.json({ id: doc.id, ...(doc.data() as any) });
    } catch (err) {
        next(err);
    }
};

export const startFallbackKyc = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const uid = user.id;

        const userDoc = await adminDb.collection("users").doc(uid).get();
        const userData = userDoc.data() || {};

        const reason = "stripe_unsupported";

        const payload = {
            userId: uid,
            role: userData.role ?? "investor",
            country: userData.country ?? "CD",
            reason,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const ref = await adminDb.collection("fallbackKycRequests").add(payload);

        await adminDb
            .collection("users")
            .doc(uid)
            .set(
                {
                    fallbackKycStatus: "pending",
                    payoutBlocked: true,
                },
                { merge: true }
            );

        await logAudit({
            action: "FALLBACK_KYC_REQUESTED",
            actorUid: uid,
            actorRole: userData.role ?? null,
            actorEmail: userData.email ?? null,
            targetCollection: "fallbackKycRequests",
            targetId: ref.id,
            targetDisplay: `Fallback KYC ${reason}`,
            before: null,
            after: payload,
            success: true,
            correlationId: null,
            metadata: { reason },
        });

        res.status(201).json({ id: ref.id, ...payload });
    } catch (err) {
        next(err);
    }
};

export const uploadFallbackKycDocs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const uid = req.user!.id;
        const { id } = req.params;
        const { bankDocumentUrl, proofOfAddressUrl } = req.body;

        const ref = adminDb.collection("fallbackKycRequests").doc(id);
        const snap = await ref.get();

        if (!snap.exists) {
            return res.status(404).json({ error: "Request not found" });
        }

        const data = snap.data()!;
        if (data.userId !== uid) {
            return res.status(403).json({ error: "Not your request" });
        }

        const update = {
            bankDocumentUrl: bankDocumentUrl ?? data.bankDocumentUrl ?? null,
            proofOfAddressUrl: proofOfAddressUrl ?? data.proofOfAddressUrl ?? null,
            updatedAt: new Date(),
        };

        await ref.set(update, { merge: true });

        await logAudit({
            action: "FALLBACK_KYC_DOCS_UPLOADED",
            actorUid: uid,
            actorRole: data.role ?? null,
            actorEmail: null,
            targetCollection: "fallbackKycRequests",
            targetId: id,
            targetDisplay: "Fallback KYC",
            before: data,
            after: { ...data, ...update },
            success: true,
            correlationId: null,
            metadata: {},
        });

        res.json({ id, ...data, ...update });
    } catch (err) {
        next(err);
    }
};
