import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payment/client";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env/env";
import Stripe from "stripe";
import { createId } from "@paralleldrive/cuid2";

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
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      
      if (!userId) {
        console.error("No userId in session metadata");
        return NextResponse.json({ error: "No userId in session metadata" }, { status: 400 });
      }

      await prisma.payment.create({
        data: {
          id: createId(),
          userId,
          amount: session.amount_total || 0,
          currency: session.currency || "eur",
          description: `Stripe payment for ${session.mode}`,
          status: session.status || "complete",
          provider: "stripe",
          provider_id: session.id,
          is_subscription: session.mode === "subscription",
          credits_amount: session.metadata?.credits ? parseInt(session.metadata.credits) : null,
        }
      });

      if (session.mode === "payment" && session.metadata?.credits) {
        const creditAmount = parseInt(session.metadata.credits);
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { credits: true }
        });
        
        if (user) {
          await prisma.user.update({
            where: { id: userId },
            data: { credits: user.credits + creditAmount }
          });
          
          await prisma.creditTransaction.create({
            data: {
              id: createId(),
              userId,
              amount: creditAmount,
              balanceAfter: user.credits + creditAmount,
              description: `Credit purchase: ${creditAmount} credits`,
              transactionType: "PURCHASE",
              paymentId: session.id,
              paymentProvider: "stripe",
            }
          });
        }
      }
      
      if (session.mode === "subscription" && session.subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          if (subscription) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                subscription_id: subscription.id,
                subscription_status: subscription.status,
                subscription_start: new Date(subscription.current_period_start * 1000),
                subscription_end: new Date(subscription.current_period_end * 1000),
                subscription_tier: session.metadata?.tier || "starter",
              }
            });
            
            const tierCredits = {
              starter: 30,
              creator: 100,
              pro: 250
            };
            
            const tier = session.metadata?.tier || "starter";
            const creditAmount = tierCredits[tier as keyof typeof tierCredits] || 0;
            
            if (creditAmount > 0) {
              const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { credits: true }
              });
              
              if (user) {
                await prisma.user.update({
                  where: { id: userId },
                  data: { credits: user.credits + creditAmount }
                });
                
                await prisma.creditTransaction.create({
                  data: {
                    id: createId(),
                    userId,
                    amount: creditAmount,
                    balanceAfter: user.credits + creditAmount,
                    description: `Subscription credits: ${tier} tier`,
                    transactionType: "SUBSCRIPTION",
                    paymentId: session.id,
                    paymentProvider: "stripe",
                  }
                });
              }
            }
          }
        } catch (error) {
          console.error("Error retrieving subscription:", error);
        }
      }
      
      break;
    }
    
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;
      const customerId = invoice.customer as string;
      
      if (subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const user = await prisma.user.findFirst({
            where: { subscription_id: subscriptionId },
            select: { id: true, credits: true, subscription_tier: true }
          });
          
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscription_status: subscription.status,
                subscription_start: new Date(subscription.current_period_start * 1000),
                subscription_end: new Date(subscription.current_period_end * 1000),
                last_credits_refresh: new Date(),
              }
            });
            
            const tierCredits = {
              starter: 30,
              creator: 100,
              pro: 250
            };
            
            const creditAmount = tierCredits[user.subscription_tier as keyof typeof tierCredits] || 0;
            
            if (creditAmount > 0) {
              await prisma.user.update({
                where: { id: user.id },
                data: { credits: user.credits + creditAmount }
              });
              
              await prisma.creditTransaction.create({
                data: {
                  id: createId(),
                  userId: user.id,
                  amount: creditAmount,
                  balanceAfter: user.credits + creditAmount,
                  description: `Monthly subscription credits: ${user.subscription_tier} tier`,
                  transactionType: "SUBSCRIPTION",
                  paymentId: invoice.id,
                  paymentProvider: "stripe",
                }
              });
            }
          }
        } catch (error) {
          console.error("Error processing invoice payment:", error);
        }
      }
      
      break;
    }
    
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      
      try {
        const user = await prisma.user.findFirst({
          where: { subscription_id: subscription.id },
          select: { id: true }
        });
        
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscription_status: subscription.status,
              subscription_start: new Date(subscription.current_period_start * 1000),
              subscription_end: new Date(subscription.current_period_end * 1000),
            }
          });
        }
      } catch (error) {
        console.error("Error updating subscription status:", error);
      }
      
      break;
    }
    
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      
      try {
        const user = await prisma.user.findFirst({
          where: { subscription_id: subscription.id },
          select: { id: true }
        });
        
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscription_status: "canceled",
              subscription_tier: "basic",
            }
          });
        }
      } catch (error) {
        console.error("Error canceling subscription:", error);
      }
      
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