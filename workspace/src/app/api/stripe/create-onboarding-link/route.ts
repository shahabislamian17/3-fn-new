// src/app/api/stripe/create-onboarding-link/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerUser } from "@/lib/server-auth";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST() {
  const user = await getServerUser();
  if (!user || !user.stripeAccountId) {
    return NextResponse.json(
      { error: "Missing Stripe account on user" },
      { status: 400 }
    );
  }

  const accountLink = await stripe.accountLinks.create({
    account: user.stripeAccountId,
    refresh_url: `${APP_URL}/dashboard/account?refresh=stripe`,
    return_url: `${APP_URL}/dashboard/account?onboarding=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
