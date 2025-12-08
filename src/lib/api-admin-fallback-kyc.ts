// frontend/src/lib/api-admin-fallback-kyc.ts
import { apiRequest } from "./api-client";

export async function getPendingFallbackKyc() {
  return apiRequest("/admin/fallback-kyc/pending", { method: "GET" });
}

export async function decideFallbackKyc(id: string, decision: "approved" | "rejected", reason?: string) {
  return apiRequest(`/admin/fallback-kyc/${id}/decision`, {
    method: "POST",
    body: { decision, reason },
  });
}