import { getArtworkById } from '@/data/artworks';
import { formatPrice } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artworkId = searchParams.get('artworkId');

  if (!artworkId) {
    return new Response('Missing artworkId', { status: 400 });
  }

  const artwork = getArtworkById(artworkId);

  if (!artwork) {
    return new Response('Artwork not found', { status: 404 });
  }

  if (artwork.status !== 'available') {
    return new Response('Artwork not available for purchase', { status: 400 });
  }

  const priceIdMap = process.env.STRIPE_PRICE_ID_MAP ? JSON.parse(process.env.STRIPE_PRICE_ID_MAP) : {};
  const stripePriceId = priceIdMap[artworkId];

  if (!stripePriceId) {
    console.warn(`No Stripe Price ID configured for artwork ${artworkId}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&artworkId=${artworkId}`;
  const cancelUrl = `${baseUrl}/?canceled=true`;

  const checkoutUrl = stripePriceId
    ? `https://checkout.stripe.com/pay/${stripePriceId}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&client_reference_id=${artworkId}`
    : `https://buy.stripe.com/test_${process.env.STRIPE_TEST_MODE || 'demo'}?amount=${artwork.price * 100}&currency=eur&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&metadata[artworkId]=${artworkId}&metadata[artworkTitle]=${encodeURIComponent(artwork.title)}`;

  return Response.redirect(checkoutUrl, 303);
}