import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, createSubscriptionCheckoutSession } from "@/lib/payment/stripe";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env/env";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    
    const { priceId, mode, metadata } = await req.json();
    
    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }
    
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true }
    });
    
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const baseUrl = env.NEXT_PUBLIC_BASE_URL;
    const successUrl = `${baseUrl}/account/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/account/payment/cancel`;
    
    let session;
    
    if (mode === "subscription") {
      session = await createSubscriptionCheckoutSession({
        priceId,
        userId: user.id,
        customerEmail: userData.email,
        metadata,
        successUrl,
        cancelUrl,
      });
    } else {
      session = await createCheckoutSession({
        priceId,
        userId: user.id,
        customerEmail: userData.email,
        metadata,
        successUrl,
        cancelUrl,
      });
    }
    
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}