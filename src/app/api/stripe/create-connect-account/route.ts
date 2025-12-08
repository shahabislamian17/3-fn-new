import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerUser } from "@/lib/server-auth";
import { updateUserStripeAccountId } from "@/lib/server-db";

export async function POST() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If already has account, reuse it
  if (user.stripeAccountId) {
    return NextResponse.json({ accountId: user.stripeAccountId });
  }

  const account = await stripe.accounts.create({
    type: "express",
    email: user.email,
    business_type: "individual",
  });

  await updateUserStripeAccountId(user.id, account.id);

  return NextResponse.json({ accountId: account.id });
}
