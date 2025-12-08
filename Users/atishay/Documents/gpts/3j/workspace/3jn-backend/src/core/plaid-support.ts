// backend/src/core/plaid-support.ts

const PLAID_SUPPORTED = ["US", "CA", "GB", "FR", "ES", "IE", "NL"];

export function isPlaidSupported(countryCode: string): boolean {
  return PLAID_SUPPORTED.includes(countryCode.toUpperCase());
}
