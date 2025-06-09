import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@imagine/database/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  console.log("Webhook received");

  try {
    const body = await request.text();
    const signature = (await headers()).get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, credits } = session.metadata || {};

        if (!userId || !credits) {
          console.error("Missing metadata in checkout session:", { userId, credits });
          return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
        }

        const creditsAmount = parseInt(credits);
        const amountInCents = Math.round(session.amount_total || 0); // amount_total is already in cents

        await prisma.payment.create({
          data: {
            userId,
            amount: amountInCents,
            currency: session.currency || "eur",
            description: `Purchase of ${credits} credits`,
            status: "completed",
            provider: "stripe",
            provider_id: session.id,
            credits_amount: creditsAmount,
            is_subscription: false,
          },
        });

        // Get current balance before updating
        const userBefore = await prisma.user.findUnique({
          where: { id: userId },
          select: { credits: true },
        });

        const balanceBefore = userBefore?.credits || 0;

        await prisma.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: creditsAmount,
            },
          },
        });

        await prisma.creditTransaction.create({
          data: {
            userId,
            amount: creditsAmount,
            balanceBefore: balanceBefore,
            balanceAfter: balanceBefore + creditsAmount,
            description: `Purchase of ${credits} credits`,
            transactionType: "PURCHASE",
          },
        });

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, credits } = paymentIntent.metadata || {};

        if (!userId || !credits) {
          console.error("Missing metadata in payment intent:", { userId, credits, paymentIntentId: paymentIntent.id });
          return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
        }

        const creditsAmount = parseInt(credits);
        const amountInCents = Math.round(paymentIntent.amount || 0);

        await prisma.payment.create({
          data: {
            userId,
            amount: amountInCents,
            currency: paymentIntent.currency || "eur",
            description: `Purchase of ${credits} credits`,
            status: "completed",
            provider: "stripe",
            provider_id: paymentIntent.id,
            credits_amount: creditsAmount,
            is_subscription: false,
          },
        });

        // Get current balance before updating
        const userBefore2 = await prisma.user.findUnique({
          where: { id: userId },
          select: { credits: true },
        });

        const balanceBefore2 = userBefore2?.credits || 0;

        await prisma.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: creditsAmount,
            },
          },
        });

        await prisma.creditTransaction.create({
          data: {
            userId,
            amount: creditsAmount,
            balanceBefore: balanceBefore2,
            balanceAfter: balanceBefore2 + creditsAmount,
            description: `Purchase of ${credits} credits`,
            transactionType: "PURCHASE",
          },
        });

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, credits } = paymentIntent.metadata || {};

        if (!userId || !credits) {
          console.error("Missing metadata in failed payment intent:", { userId, credits, paymentIntentId: paymentIntent.id });
          // Skip recording failed payments without proper metadata
          // since we can't create a Payment record without a valid userId
          break;
        }

        const creditsAmount = parseInt(credits);
        const amountInCents = Math.round(paymentIntent.amount || 0);

        await prisma.payment.create({
          data: {
            userId,
            amount: amountInCents,
            currency: paymentIntent.currency || "eur",
            description: `Purchase of ${credits} credits`,
            status: "failed",
            provider: "stripe",
            provider_id: paymentIntent.id,
            credits_amount: creditsAmount,
            is_subscription: false,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
} 