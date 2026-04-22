import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

export async function createCheckoutSession(input: {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();

  return stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: input.priceId, quantity: 1 }],
    ...(input.customerId
      ? { customer: input.customerId }
      : { customer_email: input.customerEmail }),
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: { userId: input.userId },
    subscription_data: { metadata: { userId: input.userId } },
  });
}

export async function createPortalSession(input: {
  customerId: string;
  returnUrl: string;
}) {
  const stripe = getStripe();

  return stripe.billingPortal.sessions.create({
    customer: input.customerId,
    return_url: input.returnUrl,
  });
}
