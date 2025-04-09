"use server";

import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env/env";
import { CREDIT_PACKS } from "@/lib/features/credit-pack";
import { createCheckoutSession } from "@/lib/payment/stripe";
import { getPriceId } from "../payment/prices";

export async function buyCredits(packId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const pack = CREDIT_PACKS.find(p => p.id === packId);
  if (!pack) throw new Error("Credit pack is not valid");
  
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const successUrl = `${baseUrl}/account/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/account/payment/cancel`;
  
  try {
    const session = await createCheckoutSession({
      priceId: getPriceId(pack.id),
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
    console.error("Erreur lors de la création de la session de paiement:", error);
    throw error;
  }
}