// backend/src/core/stripe-support.ts
import { getStripe } from "./stripe";

export async function isStripeSupported(countryCode: string): Promise<boolean> {
  try {
    const stripe = await getStripe();
    const spec = await stripe.countrySpecs.retrieve(countryCode.toUpperCase());
    return spec.supported_payment_currencies.length > 0;
  } catch (e) {
    // Stripe throws an error if country is unsupported
    return false;
  }
}
