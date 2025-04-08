import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payment/client";
import { env } from "@/lib/env/env";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      console.log("Checkout session completed:", event.data.object);
      break;
    }
    
    case "invoice.payment_succeeded": {
      console.log("Payment succeeded:", event.data.object);
      break;
    }
    
    case "customer.subscription.updated": {
      console.log("Subscription updated:", event.data.object);
      break;
    }
    
    case "customer.subscription.deleted": {
      console.log("Subscription deleted:", event.data.object);
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};