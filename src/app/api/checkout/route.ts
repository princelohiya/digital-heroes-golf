import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(request: Request) {
  try {
    const { userId, plan } = await request.json();

    // The PRD requires Monthly and Yearly discounted plans
    // In Stripe, you would create these Products/Prices in the dashboard and paste their Price IDs here.
    const priceId =
      plan === "yearly"
        ? "price_1TEkwzPYWMR5SEFytAtujhDZ"
        : "price_1TEkwcPYWMR5SEFy2pKgEGlD";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
      // WE CRUCIALLY PASS THE USER ID HERE SO THE WEBHOOK KNOWS WHO PAID
      client_reference_id: userId,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
