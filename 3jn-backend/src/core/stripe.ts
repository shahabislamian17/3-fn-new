import Stripe from "stripe";
import { getSecret } from "./secrets";

let stripeSingleton: Stripe;

export async function getStripe() {
    if (!stripeSingleton) {
        const stripeSecretKey = await getSecret("STRIPE_SECRET_KEY");
        if (!stripeSecretKey) {
            throw new Error("STRIPE_SECRET_KEY secret not found in Secret Manager.");
        }
        stripeSingleton = new Stripe(stripeSecretKey, {
            apiVersion: "2024-06-20",
        });
    }
    return stripeSingleton;
}
