
// backend/src/controllers/kyc.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { adminDb } from "@/core/firebase";
import { hasRole } from "@/core/rbac";

export const createKycSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const kycProvider = "sumsub"; // Example provider

        // In a real implementation:
        // 1. Create an applicant with the provider SDK
        // const applicant = await sumsub.createApplicant({ externalUserId: user.id, email: user.email });
        const applicantId = `sumsub_applicant_${user.id}_${Date.now()}`;
        
        // 2. Get a temporary access token for the frontend SDK
        // const accessToken = await sumsub.getAccessToken(applicantId);
        const accessToken = `mock_sdk_token_for_${user.id}`;
        
        // 3. Store the provider-specific applicant ID against our user
        await adminDb.collection("kycProfiles").doc(user.id).set({
            userId: user.id,
            provider: kycProvider,
            providerApplicantId: applicantId,
            status: 'pending_submission',
            createdAt: new Date(),
        }, { merge: true });

        // 4. Return the token to the frontend to initialize the SDK
        res.json({
            accessToken,
            applicantId,
        });

    } catch (err) {
        next(err);
    }
};

export const kycWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const provider = req.params.provider;
        const rawPayload = req.body;
        
        // --- CRITICAL SECURITY STEP ---
        // Verify webhook signature here. Each provider (Sumsub, Onfido, etc.)
        // has a specific way to do this, usually involving a secret key.
        // if (!isSignatureValid(req.headers['x-signature'], rawPayload, WEBHOOK_SECRET)) {
        //    return res.status(401).send('Invalid signature');
        // }
        
        // --- PROCESS WEBHOOK ---
        // This is a generic handler. Specific logic will depend on the provider's payload structure.
        const { applicantId, reviewStatus, reviewResult } = rawPayload;

        if (!applicantId) {
            return res.status(400).json({ error: "Missing applicantId from webhook payload" });
        }

        const kycProfileQuery = await adminDb.collection("kycProfiles").where("providerApplicantId", "==", applicantId).limit(1).get();
        if (kycProfileQuery.empty) {
            console.warn(`Received webhook for unknown applicantId: ${applicantId}`);
            return res.status(404).json({ error: "Applicant profile not found" });
        }
        
        const kycProfileDoc = kycProfileQuery.docs[0];
        const userId = kycProfileDoc.data().userId;

        // Map provider status to our internal status
        let internalStatus: "passed" | "failed" | "pending" = "pending";
        if (reviewStatus === "completed") {
            if (reviewResult.reviewAnswer === 'GREEN') {
                internalStatus = 'passed';
            } else {
                internalStatus = 'failed';
            }
        }

        // Update both user's main status and the detailed KYC profile
        const userRef = adminDb.collection("users").doc(userId);
        await userRef.update({ kycStatus: internalStatus, kycReviewedAt: new Date() });

        await kycProfileDoc.ref.update({
            status: internalStatus,
            providerRawStatus: reviewStatus,
            reviewResult: reviewResult || null,
            updatedAt: new Date(),
        });
        
        console.log(`KYC status for user ${userId} updated to ${internalStatus} by ${provider} webhook.`);
        
        res.status(200).json({ received: true });

    } catch(err) {
        next(err);
    }
};
