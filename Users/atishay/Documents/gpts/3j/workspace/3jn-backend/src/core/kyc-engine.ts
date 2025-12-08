// backend/src/lib/kyc-engine.ts
import { User } from './types';

export function evaluateUserKyc(user: Partial<User>) {
  const {
    kycStatus,
    fallbackKycStatus,
    stripeSupported,
    plaidSupported,
  } = user;

  // Normal mode: Stripe/Plaid supported
  if (stripeSupported || plaidSupported) {
    return {
      mode: "normal",
      canInvest: kycStatus === "passed",
      canPublishProjects: kycStatus === "passed",
      canPayout: kycStatus === "passed",
      reason: "Stripe/Plaid supported for this user",
    };
  }

  // Fallback mode
  if (fallbackKycStatus === "approved") {
    return {
      mode: "fallback",
      canInvest: kycStatus === "passed",
      canPublishProjects: kycStatus === "passed",
      canPayout: true,
      reason: "Fallback KYC fully approved",
    };
  }

  return {
    mode: "fallback",
    canInvest: kycStatus === "passed",
    canPublishProjects: kycStatus === "passed",
    canPayout: false,
    reason: "Fallback verification required before payout",
  };
}
