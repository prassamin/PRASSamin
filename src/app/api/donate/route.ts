import { NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { getOrigin } from "@/lib/url";
import { POLAR_DONATION_PRODUCT_ID } from "@/constants/env";

export async function POST(req: Request) {
  try {
    const { amount, email, name, message } = await req.json();
    
    if (!POLAR_DONATION_PRODUCT_ID) {
      return NextResponse.json({ error: "Donation product ID not configured" }, { status: 500 });
    }

    // Convert dollars to cents for Polar API
    const amountInCents = Math.round(parseFloat(amount) * 100);
    const origin = await getOrigin();

    const checkoutPayload: any = {
      products: [POLAR_DONATION_PRODUCT_ID],
      successUrl: `${origin}/donate/success?checkout_id={CHECKOUT_ID}`,
      amount: amountInCents,
    };

    if (email) checkoutPayload.customerEmail = email;
    if (name) checkoutPayload.customerName = name;
    if (message) checkoutPayload.customFieldData = { message };

    const checkout = await polar.checkouts.create(checkoutPayload);

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Donation Checkout Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
