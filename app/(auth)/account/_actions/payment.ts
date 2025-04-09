"use server";

import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env/env";
import { CREDIT_PACKS } from "@/lib/features/credit-pack";
import { createCheckoutSession } from "@/lib/payment/stripe";

export const buyCredits = async (packId: string) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const pack = CREDIT_PACKS.find(p => p.id === packId);
  if (!pack) throw new Error("Invalid credit pack");
  
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