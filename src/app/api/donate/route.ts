import { NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { getOrigin } from "@/lib/url";
import {
  isDonationEnabled,
  POLAR_DONATION_PRODUCT_ID,
  POLAR_DONATION_SUBSCRIPTION_PRODUCT_ID,
} from "@/constants/env";
import { CheckoutCreate } from "@polar-sh/sdk/models/components/checkoutcreate";

export async function POST(req: Request) {
  try {
    if (!isDonationEnabled()) {
      return NextResponse.json(
        { error: "Donations are not configured" },
        { status: 503 },
      );
    }

    const { amount, email, name, message, socialUrl, recurring } =
      await req.json();

    // Pick product based on mode
    const productId = recurring
      ? POLAR_DONATION_SUBSCRIPTION_PRODUCT_ID
      : POLAR_DONATION_PRODUCT_ID;

    if (!productId) {
      return NextResponse.json(
        { error: "Donation product ID not configured" },
        { status: 500 },
      );
    }

    // Convert dollars to cents for Polar API
    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (!amountInCents || isNaN(amountInCents) || amountInCents <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const origin = await getOrigin();

    const checkoutPayload: CheckoutCreate = {
      products: [productId],
      successUrl: `${origin}/donate/success?checkout_id={CHECKOUT_ID}`,
      amount: amountInCents,
    };

    if (email) checkoutPayload.customerEmail = email;
    if (name) checkoutPayload.customerName = name;

    const metadata: Record<string, string> = {};
    if (message) metadata.message = message;
    if (socialUrl) metadata.socialUrl = socialUrl;
    if (socialUrl) metadata.name = name;
    if (Object.keys(metadata).length > 0) {
      checkoutPayload.customerMetadata = metadata;
    }

    const checkout = await polar.checkouts.create(checkoutPayload);

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Donation Checkout Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
