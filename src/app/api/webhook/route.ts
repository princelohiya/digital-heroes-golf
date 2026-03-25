import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// We MUST use the Service Role key here to bypass RLS securely from the server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Handle the successful subscription
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // This is the userId we passed from our checkout route earlier
    const userId = session.client_reference_id;
    const customerId = session.customer as string;

    if (userId) {
      console.log(`Activating subscription for user: ${userId}`);
      // Update the user's profile in Supabase to active!
      await supabaseAdmin
        .from("users")
        .update({
          subscription_status: "active",
          stripe_customer_id: customerId,
          subscription_plan: "monthly",
        })
        .eq("id", userId);
    }
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}
