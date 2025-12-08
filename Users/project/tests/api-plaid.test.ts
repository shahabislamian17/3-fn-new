import { describe, it, expect, vi } from "vitest";

// Mock environment variables before importing modules that use them
vi.stubEnv('PLAID_CLIENT_ID', 'test_client_id');
vi.stubEnv('PLAID_SECRET', 'test_secret');

describe("Plaid API Modules", () => {
  it("plaidClient loads and has methods", async () => {
    // Dynamically import the module after mocking env vars
    const { plaidClient } = await import("@/lib/plaid");
    expect(plaidClient).toBeDefined();
    expect(typeof plaidClient.linkTokenCreate).toBe("function");
  });
});
