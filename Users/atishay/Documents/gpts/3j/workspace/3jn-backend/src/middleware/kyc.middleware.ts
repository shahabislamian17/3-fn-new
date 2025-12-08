// backend/src/middleware/kyc.middleware.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { adminDb } from "@/core/firebase";
import { hasRole } from "@/core/rbac";

type KycAction = "publish_project" | "invest";

interface KycOptions {
  allowAdminOverride?: boolean; // if true, admin/superadmin can bypass
}

async function getUserKycStatus(uid: string): Promise<"pending" | "failed" | "passed" | null> {
  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  return (data.kycStatus as any) ?? null;
}

export function requireKycPassed(action: KycAction, options: KycOptions = {}) {
  const { allowAdminOverride = true } = options;

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Admins can bypass KYC gate for manual operations
    if (allowAdminOverride && hasRole(user, 'Admin')) {
      return next();
    }

    const kycStatus = await getUserKycStatus(user.id);

    if (kycStatus !== "passed") {
      let reason = "KYC not passed";

      if (kycStatus === "pending") {
        reason = "KYC is pending approval";
      } else if (kycStatus === "failed") {
        reason = "KYC was rejected";
      }

      return res.status(403).json({
        error: reason,
        code: "KYC_REQUIRED",
      });
    }

    return next();
  };
}
