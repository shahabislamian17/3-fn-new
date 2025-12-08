// frontend/src/hooks/useKycGate.ts
"use client";

import { useUser } from "@/firebase/auth/use-user"; // your existing hook

type Action = "publish_project" | "invest";

export function useKycGate(action: Action) {
  const user = useUser();
  const loading = !user; // Simple loading state based on user presence

  if (loading) {
    return { allowed: false, reason: "Loading...", requiresKyc: false };
  }

  if (!user) {
    return {
      allowed: false,
      reason: "You must be logged in to perform this action.",
      requiresKyc: false,
    };
  }

  const role = user.role;
  const kycStatus = (user as any).kycStatus; // Assuming kycStatus is on the extended user object

  if (action === "publish_project" && role !== "ProjectOwner") {
    return {
      allowed: false,
      reason: "Only Project Owners can publish projects.",
      requiresKyc: false,
    };
  }

  if (action === "invest" && role !== "Investor") {
    return {
      allowed: false,
      reason: "Only Investors can invest in projects.",
      requiresKyc: false,
    };
  }

  if (kycStatus !== "passed") {
    return {
      allowed: false,
      reason:
        kycStatus === "pending"
          ? "Your identity verification is pending approval."
          : "You must complete and pass KYC before continuing.",
      requiresKyc: true,
    };
  }

  return { allowed: true, reason: "", requiresKyc: false };
}
