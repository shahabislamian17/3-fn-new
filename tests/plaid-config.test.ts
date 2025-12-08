import { describe, it, expect, vi } from "vitest";

// Mock the environment variables before importing the module
vi.stubEnv('PLAID_CLIENT_ID', 'test_client_id');
vi.stubEnv('PLAID_SECRET', 'test_secret');

describe("Plaid configuration", () => {
  it("should instantiate plaid client without throwing an error", async () => {
    // Dynamically import the module AFTER mocking the env vars
    const { plaidClient } = await import("@/lib/plaid");
    expect(plaidClient).toBeDefined();
  });
});
