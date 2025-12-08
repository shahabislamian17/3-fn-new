
import { describe, it, expect, vi } from "vitest";

vi.mock('@/lib/stripe', async (importOriginal) => {
  vi.stubEnv('STRIPE_SECRET_KEY', 'test_secret_key');
  const original = await importOriginal<typeof import('@/lib/stripe')>();
  return {
    ...original,
  };
});

describe("Stripe client", () => {
  it("stripe client loads", async () => {
    const { stripe } = await import("@/lib/stripe");
    expect(stripe).toBeDefined();
    expect(typeof stripe.accounts.create).toBe("function");
  });
});
