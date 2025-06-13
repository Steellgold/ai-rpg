import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@imagine/database/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { stripe_customer_id: true },
    });

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/credits`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    return NextResponse.json(
      { error: "Failed to create customer portal session" },
      { status: 500 }
    );
  }
} 