
import { describe, it, expect, vi } from "vitest";

// Mock environment variables before importing the module
vi.mock('@/lib/plaid', async (importOriginal) => {
  vi.stubEnv('PLAID_CLIENT_ID', 'test_client_id');
  vi.stubEnv('PLAID_SECRET', 'test_secret');
  const original = await importOriginal<typeof import('@/lib/plaid')>();
  return {
    ...original,
  };
});

describe("Plaid API Modules", () => {
  it("plaidClient loads and has methods", async () => {
    const { plaidClient } = await import("@/lib/plaid");
    expect(plaidClient).toBeDefined();
    expect(typeof plaidClient.linkTokenCreate).toBe("function");
  });
});
