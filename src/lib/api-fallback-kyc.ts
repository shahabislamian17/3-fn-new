// frontend/src/lib/api-fallback-kyc.ts
import { apiRequest } from "./api-client";

export async function getFallbackKycStatus() {
  return apiRequest("/kyc/fallback/status", { method: "GET" });
}

export async function startFallbackKyc() {
  return apiRequest("/kyc/fallback/start", { method: "POST" });
}

export async function uploadFallbackKycDocs(id: string, payload: {
  bankDocumentUrl?: string;
  proofOfAddressUrl?: string;
}) {
  return apiRequest(`/kyc/fallback/${id}/documents`, {
    method: "POST",
    body: payload,
  });
}
