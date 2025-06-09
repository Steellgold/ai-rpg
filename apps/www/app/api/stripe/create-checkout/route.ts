import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { prisma } from "@imagine/database/prisma";
import { stripe } from "@/lib/stripe";
import { getPackageById } from "@/lib/config/credit-packages";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();

    const { packageId } = await request.json();
    const creditPackage = getPackageById(packageId);

    if (!creditPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { stripe_customer_id: true },
    });

    let stripeCustomerId = user?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customerParams = {
        email: session.user?.email || undefined,
        metadata: {
          userId: session.user?.id || null,
        },
      };
      const customer = await stripe.customers.create(customerParams);

      await prisma.user.update({
        where: { id: session.user!.id },
        data: { stripe_customer_id: customer.id },
      });

      stripeCustomerId = customer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: creditPackage.currency.toLowerCase(),
            product_data: {
              name: creditPackage.name,
              description: creditPackage.description,
              images: [`${process.env.NEXT_PUBLIC_BASE_URL}${creditPackage.image}`],
            },
            unit_amount: Math.round(creditPackage.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/credits/cancel`,
      metadata: {
        userId: session.user!.id,
        packageId: creditPackage.id,
        credits: creditPackage.credits.toString(),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
} 