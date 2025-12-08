import { describe, it, expect, vi } from "vitest";

// Mock the environment variable before importing the module
vi.stubEnv('STRIPE_SECRET_KEY', 'test_secret_key');

describe("Stripe configuration", () => {
  it("should instantiate stripe client without throwing an error", async () => {
    // Dynamically import the module AFTER mocking the env var
    const { stripe } = await import("@/lib/stripe");
    expect(stripe).toBeDefined();
  });
});
