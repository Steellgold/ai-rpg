import { stripe } from "./client";

export const createCheckoutSession = async (options: {
  priceId: string;
  userId: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}) => {
  const { priceId, userId, customerEmail, metadata, successUrl, cancelUrl } = options;

  return stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      userId,
      ...metadata,
    },
  });
};