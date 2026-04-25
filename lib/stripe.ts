// TODO: install stripe and replace this stub with the real client.
// import Stripe from "stripe";

export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY ?? "",
};

export function getStripe() {
  if (!stripeConfig.secretKey) {
    throw new Error(
      "Missing Stripe env var. Set STRIPE_SECRET_KEY in .env.local."
    );
  }
  // TODO: replace with new Stripe(stripeConfig.secretKey, { apiVersion: "..." })
  return { secretKey: stripeConfig.secretKey };
}
