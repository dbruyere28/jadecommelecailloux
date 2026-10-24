import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Artwork } from '@/types/artwork';
import { getStripeClient } from '@/lib/stripe';

const ARTWORKS_KEY = 'artworks_catalog';

async function updateArtworkFromCheckout(
  session: Stripe.Checkout.Session,
  nextStatus: 'sold' | 'available'
) {
  const artworkId = session.metadata?.artworkId;
  const reservationToken = session.metadata?.reservationToken;
  if (!artworkId || !reservationToken) return;

  const reservationKey = `artwork_checkout_lock:${artworkId}`;
  const currentReservation = await kv.get<string>(reservationKey);
  if (currentReservation !== reservationToken) return;

  const artworks = await kv.get<Artwork[]>(ARTWORKS_KEY) || [];
  const artwork = artworks.find((item) => item.id === artworkId);
  if (!artwork) {
    await kv.del(reservationKey);
    return;
  }

  if (nextStatus === 'available' && artwork.status !== 'reserved') {
    await kv.del(reservationKey);
    return;
  }

  const updatedArtworks = artworks.map((item) =>
    item.id === artworkId ? { ...item, status: nextStatus } : item
  );

  await kv.set(ARTWORKS_KEY, updatedArtworks);
  await kv.del(reservationKey);
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook Stripe non configuré.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = getStripeClient().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Signature Stripe invalide:', error);
    return NextResponse.json({ error: 'Signature Stripe invalide.' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === 'paid') {
        await updateArtworkFromCheckout(session, 'sold');
      }
    } else if (event.type === 'checkout.session.expired') {
      await updateArtworkFromCheckout(event.data.object as Stripe.Checkout.Session, 'available');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur de traitement du webhook Stripe:', error);
    return NextResponse.json({ error: 'Échec du traitement du paiement.' }, { status: 500 });
  }
}
