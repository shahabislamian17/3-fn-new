// backend/src/types/auto-approval.ts

export type ApprovalType =
  | "project"
  | "investment"
  | "payout"
  | "kyc"
  | "fallback_kyc"
  | "document"
  | "upgrade";

export interface AutoApprovalUserContext {
  id: string;
  role: string;
  riskScore: number;
  riskTier: "low" | "medium" | "high";
  riskFlags: string[];
  kycStatus: "not_started" | "pending" | "passed" | "failed";
  fallbackKycStatus: "not_required" | "required" | "pending" | "approved" | "rejected";
  payoutBlocked: boolean;
  countryRiskTier: "tier1" | "tier2" | "tier3";
}

export interface AutoApprovalEntityContext {
  id: string;
  type: ApprovalType;
  fields: Record<string, any>;
}

export interface AutoApprovalInput {
  type: ApprovalType;
  user: AutoApprovalUserContext;
  entity: AutoApprovalEntityContext;
}

export interface AutoApprovalDecision {
  decision: "approve" | "reject" | "escalate";
  reason: string;
  requiresManualReview: boolean;
}
