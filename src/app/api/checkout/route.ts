import { randomUUID } from 'node:crypto';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Artwork } from '@/types/artwork';
import { SHIPPING_ZONES, ShippingZone } from '@/lib/shipping-zones';
import { getAllowedShippingCountries } from '@/lib/shipping-countries.server';
import { hasMaintenanceAccess, MAINTENANCE_ACCESS_COOKIE, MAINTENANCE_KEY } from '@/lib/maintenance-auth.server';
import { getStripeClient } from '@/lib/stripe';
import { localizeArtwork } from '@/lib/localized-artwork';
import { SiteLocale } from '@/lib/messages';

const ARTWORKS_KEY = 'artworks_catalog';
const RESERVATION_TTL_SECONDS = 60 * 60;

export async function POST(request: NextRequest) {
  let reservationKey: string | undefined;
  let reservationToken: string | undefined;
  let reservationAcquired = false;
  let session: Stripe.Checkout.Session | undefined;
  let stripe: ReturnType<typeof getStripeClient> | undefined;

  try {
    const body: { artworkId?: string; shippingZone?: ShippingZone; offerAmount?: number; locale?: string } = await request.json();
    const artworkId = body.artworkId?.trim();
    const shippingZone = body.shippingZone;

    if (!artworkId || artworkId.length > 128) {
      return NextResponse.json({ error: 'Œuvre invalide.' }, { status: 400 });
    }

    if (!shippingZone || !Object.hasOwn(SHIPPING_ZONES, shippingZone)) {
      return NextResponse.json({ error: 'Choisissez une zone de livraison valide.' }, { status: 400 });
    }

    const maintenanceEnabled = await kv.get<boolean>(MAINTENANCE_KEY);
    if (maintenanceEnabled && !hasMaintenanceAccess(request.cookies.get(MAINTENANCE_ACCESS_COOKIE)?.value)) {
      return NextResponse.json({ error: 'Les achats sont suspendus pendant la maintenance.' }, { status: 503 });
    }

    stripe = getStripeClient();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: 'Le site de paiement n’est pas encore configuré.' }, { status: 503 });
    }

    const parsedBaseUrl = new URL(baseUrl);
    if (parsedBaseUrl.protocol !== 'https:' && parsedBaseUrl.hostname !== 'localhost') {
      return NextResponse.json({ error: 'URL de paiement non sécurisée.' }, { status: 500 });
    }

    const artworks = await kv.get<Artwork[]>(ARTWORKS_KEY) || [];
    const artwork = artworks.find((item) => item.id === artworkId);
    if (!artwork) {
      return NextResponse.json({ error: 'Cette œuvre n’existe plus dans la galerie.' }, { status: 404 });
    }
    if (artwork.status !== 'available') {
      return NextResponse.json({ error: 'Cette œuvre n’est plus disponible.' }, { status: 409 });
    }

    const locale: SiteLocale = body.locale === 'de' || body.locale === 'en' ? body.locale : 'fr';
    const localizedArtwork = localizeArtwork(artwork, locale);

    const minimumAmountInCents = Math.round(artwork.price * 100);
    const amountInCents = Math.round(Number(body.offerAmount) * 100);
    if (
      !Number.isSafeInteger(minimumAmountInCents) ||
      minimumAmountInCents < 50 ||
      !Number.isSafeInteger(amountInCents) ||
      amountInCents < minimumAmountInCents ||
      amountInCents > 99_999_999
    ) {
      return NextResponse.json(
        { error: `Votre offre doit être au moins égale au prix minimum de ${artwork.price} €.` },
        { status: 400 }
      );
    }

    reservationKey = `artwork_checkout_lock:${artworkId}`;
    reservationToken = randomUUID();
    const lockResult = await kv.set(reservationKey, reservationToken, {
      nx: true,
      ex: RESERVATION_TTL_SECONDS,
    });
    if (lockResult !== 'OK') {
      return NextResponse.json({ error: 'Un achat est déjà en cours pour cette œuvre.' }, { status: 409 });
    }
    reservationAcquired = true;

    const shipping = SHIPPING_ZONES[shippingZone];
    const exchangeRate = await kv.get<{ usdPerEur?: number; fetchedAt?: number }>('eur_usd_daily_rate');
    const usdPerEur = exchangeRate?.fetchedAt && Date.now() - exchangeRate.fetchedAt < 7 * 24 * 60 * 60 * 1000
      ? exchangeRate.usdPerEur
      : undefined;
    const artworkImage = artwork.image.startsWith('https://') ? artwork.image : undefined;
    const origin = parsedBaseUrl.origin;
    const expiresAt = Math.floor(Date.now() / 1000) + 31 * 60;

    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      allowed_payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: amountInCents,
            product_data: {
              name: localizedArtwork.title,
              description: `${artwork.width} × ${artwork.height} cm · ${localizedArtwork.technique}`,
              ...(artworkImage ? { images: [artworkImage] } : {}),
            },
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: getAllowedShippingCountries(shippingZone) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: `Livraison — ${shipping.label}`,
            fixed_amount: {
              amount: shipping.priceCents,
              currency: 'eur',
            },
          },
        },
      ],
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      expires_at: expiresAt,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#gallery`,
      metadata: {
        artworkId,
        artworkTitle: localizedArtwork.title,
        shippingZone,
        offerAmountCents: String(amountInCents),
        ...(usdPerEur && Number.isFinite(usdPerEur) ? { usdPerEur: String(usdPerEur) } : {}),
        reservationToken,
      },
      payment_intent_data: {
        metadata: {
          artworkId,
          offerAmountCents: String(amountInCents),
          reservationToken,
        },
      },
    });

    if (!session.url) throw new Error('Stripe n’a pas fourni de lien de paiement.');

    const latestArtworks = await kv.get<Artwork[]>(ARTWORKS_KEY) || [];
    const currentArtwork = latestArtworks.find((item) => item.id === artworkId);
    if (!currentArtwork || currentArtwork.status !== 'available') {
      await stripe.checkout.sessions.expire(session.id);
      await kv.del(reservationKey);
      reservationAcquired = false;
      return NextResponse.json({ error: 'Cette œuvre vient d’être réservée par une autre personne.' }, { status: 409 });
    }

    await kv.set(
      ARTWORKS_KEY,
      latestArtworks.map((item) => item.id === artworkId ? { ...item, status: 'reserved' } : item)
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erreur de création du paiement Stripe:', error);
    if (session?.status === 'open' && stripe) {
      await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
    }
    if (reservationAcquired && reservationKey) {
      await kv.del(reservationKey).catch(() => undefined);
    }
    return NextResponse.json(
      { error: 'Impossible de préparer le paiement. Vérifiez la configuration Stripe en mode test.' },
      { status: 503 }
    );
  }
}
