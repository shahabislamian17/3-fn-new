import { describe, it, expect, vi } from "vitest";

// Mock environment variables before importing modules that use them
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');

describe("Stripe client", () => {
  it("stripe client loads", async () => {
    // Dynamically import the module after mocking env vars
    const { stripe } = await import("@/lib/stripe");
    expect(stripe).toBeDefined();
    expect(typeof stripe.accounts.create).toBe("function");
  });
});
