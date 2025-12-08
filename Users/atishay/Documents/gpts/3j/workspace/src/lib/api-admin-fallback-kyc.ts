// frontend/src/lib/api-admin-fallback-kyc.ts
import { fetcher } from "./api-client";

export async function getPendingFallbackKyc() {
  return fetcher("/admin/fallback-kyc/pending", { method: "GET" });
}

export async function decideFallbackKyc(id: string, decision: "approved" | "rejected", reason?: string) {
  return fetcher(`/admin/fallback-kyc/${id}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, reason }),
  });
}
