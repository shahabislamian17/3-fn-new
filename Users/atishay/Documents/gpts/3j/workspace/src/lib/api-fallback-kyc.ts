// frontend/src/lib/api-fallback-kyc.ts
import { fetcher } from "./api-client";

export async function getFallbackKycStatus() {
  return fetcher("/kyc/fallback/status", { method: "GET" });
}

export async function startFallbackKyc() {
  return fetcher("/kyc/fallback/start", { method: "POST" });
}

export async function uploadFallbackKycDocs(id: string, payload: {
  bankDocumentUrl?: string;
  proofOfAddressUrl?: string;
}) {
  return fetcher(`/kyc/fallback/${id}/documents`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
