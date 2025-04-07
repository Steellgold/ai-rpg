"use server";

import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env/env";
import { CREDIT_PACKS, SUBSCRIPTION_PLANS, SubscriptionTier } from "@/lib/features/subscription-plan";
import { createCheckoutSession, createSubscriptionCheckoutSession } from "@/lib/payment/stripe";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/payment/client";

export async function buyCredits(packId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const pack = CREDIT_PACKS.find(p => p.id === packId);
  if (!pack) {
    throw new Error("Invalid credit pack");
  }
  
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const successUrl = `${baseUrl}/account/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/account/payment/cancel`;
  
  const priceId = process.env.NODE_ENV === "development" ? `price_test_${packId}` : `price_${packId}`;
  
  try {
    const session = await createCheckoutSession({
      priceId,
      userId: user.id,
      metadata: {
        credits: String(pack.amount + (pack.bonusAmount || 0)),
        packId
      },
      successUrl,
      cancelUrl
    });
    
    return { url: session.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function subscribe(options: {
  planId: SubscriptionTier;
  priceId: string;
  billingPeriod: "monthly" | "yearly";
}) {
  const { planId, priceId, billingPeriod } = options;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    throw new Error("Invalid subscription plan");
  }
  
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const successUrl = `${baseUrl}/account/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/account/payment/cancel`;
  
  const stripePriceId = process.env.NODE_ENV === "development" ? `price_test_${planId}_${billingPeriod}` : priceId;
  
  try {
    const session = await createSubscriptionCheckoutSession({
      priceId: stripePriceId,
      userId: user.id,
      metadata: {
        tier: planId,
        billingPeriod
      },
      successUrl,
      cancelUrl
    });
    
    return { url: session.url };
  } catch (error) {
    console.error("Error creating subscription session:", error);
    throw error;
  }
}

export async function cancelSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscription_id: true }
  });
  
  if (!userData?.subscription_id) {
    throw new Error("No active subscription found");
  }
  
  try {
    await stripe.subscriptions.update(userData.subscription_id, {
      cancel_at_period_end: true
    });
    
    await prisma.user.update({
      where: { id: user.id },
      data: { subscription_status: "canceled" }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}