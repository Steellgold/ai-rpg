import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payment/client";
import { env } from "@/lib/env/env";
import { prisma } from "@/lib/db/prisma";
import { addCredits } from "@/lib/credits";
import { createId } from "@paralleldrive/cuid2";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  if (!signature) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.metadata?.userId) {
          console.error("Missing userId in session metadata");
          break;
        }

        const userId = session.metadata.userId;
        
        if (session.metadata.credits) {
          const creditAmount = parseInt(session.metadata.credits, 10);
          const packId = session.metadata.packId;
          
          if (isNaN(creditAmount) || creditAmount <= 0) {
            console.error("Invalid credit amount:", session.metadata.credits);
            break;
          }
          
          await addCredits(userId, creditAmount, `Buy credits pack ${packId || "unknown"}`, "PURCHASE", session.id);
          
          await prisma.payment.create({
            data: {
              id: createId(),
              userId: userId,
              amount: session.amount_total ? session.amount_total / 100 : 0,
              currency: session.currency?.toUpperCase() || "EUR",
              description: `Achat de pack de crédits: ${packId || "inconnu"}`,
              status: "completed",
              provider: "stripe",
              provider_id: session.id,
              credits_amount: creditAmount,
              is_subscription: false
            }
          });
          
          console.log(`Added ${creditAmount} credits to user ${userId}`);
        }
        break;
      }
      
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook: ${error}`);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};