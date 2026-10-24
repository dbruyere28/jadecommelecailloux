import 'server-only';

import Stripe from 'stripe';

let stripeClient: Stripe | undefined;

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey?.startsWith('sk_test_') && !secretKey?.startsWith('rk_test_')) {
    throw new Error('Stripe doit être configuré avec une clé secrète de test (sk_test_… ou rk_test_…).');
  }

  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}
