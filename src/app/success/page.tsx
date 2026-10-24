import { Suspense } from 'react';
import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { CheckCircle, CircleAlert } from 'lucide-react';
import { getStripeClient } from '@/lib/stripe';
import { formatPrice, formatUsdEstimate } from '@/lib/utils';
import { localeFromGeo, messages, SiteLocale, translate } from '@/lib/messages';

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  return (
    <Suspense
      fallback={(
        <main className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4 py-20">
          <p className="text-zinc-600 dark:text-zinc-400" aria-live="polite">…</p>
        </main>
      )}
    >
      <SuccessDetails searchParams={searchParams} />
    </Suspense>
  );
}

async function SuccessDetails({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const savedLocale = cookieStore.get('site_locale')?.value;
  const locale: SiteLocale = savedLocale === 'fr' || savedLocale === 'en' || savedLocale === 'de'
    ? savedLocale
    : localeFromGeo(requestHeaders.get('x-vercel-ip-country'), requestHeaders.get('accept-language'));
  const t = (key: keyof typeof messages.fr, values?: Record<string, string | number>) => translate(locale, key, values);
  let paymentConfirmed = false;
  let artworkTitle: string | undefined;
  let offerAmount: string | undefined;
  let usdOfferAmount: string | null = null;

  if (sessionId?.startsWith('cs_test_')) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
      paymentConfirmed = session.status === 'complete' && session.payment_status === 'paid';
      artworkTitle = session.metadata?.artworkTitle;
      const offerAmountCents = Number(session.metadata?.offerAmountCents);
      if (Number.isSafeInteger(offerAmountCents) && offerAmountCents > 0) {
        offerAmount = formatPrice(offerAmountCents / 100, locale);
        const usdPerEur = Number(session.metadata?.usdPerEur);
        usdOfferAmount = formatUsdEstimate(offerAmountCents / 100, usdPerEur, locale);
      }
    } catch (error) {
      console.error('Impossible de vérifier la session Stripe:', error);
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4 py-20">
      <section className="max-w-md w-full text-center space-y-8">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
          paymentConfirmed
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
        }`}>
          {paymentConfirmed
            ? <CheckCircle className="w-12 h-12" aria-hidden="true" />
            : <CircleAlert className="w-12 h-12" aria-hidden="true" />}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-900 dark:text-white">
            {paymentConfirmed ? t('success.thanks') : t('success.notConfirmed')}
          </h1>
          {paymentConfirmed ? (
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {artworkTitle ? t('success.paid', { title: artworkTitle }) : t('success.paidGeneric')}
              {offerAmount && <> {t('success.offerPaid', { amount: offerAmount })}{usdOfferAmount && ` (${t('currency.approxShort', { amount: usdOfferAmount })})`}</>}
              {' '}{t('success.shipping')}
            </p>
          ) : (
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('success.notPaid')}
            </p>
          )}
        </div>

        {paymentConfirmed && sessionId && (
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm">
            <p className="text-zinc-500 dark:text-zinc-400">{t('success.reference')}</p>
            <p className="font-mono text-zinc-900 dark:text-white break-all mt-1">{sessionId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/#gallery"
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            {t('success.backGallery')}
          </Link>
          <Link
            href="/#contact"
            className="w-full sm:w-auto px-8 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {t('success.contact')}
          </Link>
        </div>
      </section>
    </main>
  );
}
