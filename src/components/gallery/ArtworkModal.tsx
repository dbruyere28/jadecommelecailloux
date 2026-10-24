'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { X, Maximize, Minimize, ShoppingBag, Info, Loader2 } from 'lucide-react';
import { Artwork } from '@/types/artwork';
import { formatPrice, formatUsdEstimate, formatDimensions, getStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { SHIPPING_ZONES, ShippingZone } from '@/lib/shipping-zones';
import { useLocale } from '@/components/LocaleProvider';
import { localizeArtwork } from '@/lib/localized-artwork';

interface ArtworkModalProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (shippingZone: ShippingZone, offerAmount: number) => Promise<void>;
}

export function ArtworkModal({ artwork, isOpen, onClose, onPurchase }: ArtworkModalProps) {
  const { locale, usdPerEur, t } = useLocale();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [offerAmount, setOfferAmount] = useState(String(artwork?.price ?? 0));
  const [shippingZone, setShippingZone] = useState<ShippingZone>('france');
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'f' || e.key === 'F') setIsFullscreen(!isFullscreen);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isFullscreen]);

  if (!artwork || !isOpen) return null;

  const isSold = artwork.status === 'sold';
  const isReserved = artwork.status === 'reserved';
  const localizedArtwork = localizeArtwork(artwork, locale);
  const usdMinimum = formatUsdEstimate(artwork.price, usdPerEur);
  const usdOffer = formatUsdEstimate(Number(offerAmount), usdPerEur);

  const handlePurchase = async () => {
    const numericOffer = Number(offerAmount);
    if (!artwork || !Number.isFinite(numericOffer) || numericOffer < artwork.price) {
      setCheckoutError(t('offer.minimumError', { amount: formatPrice(artwork?.price ?? 0, locale) }));
      return;
    }

    setIsStartingCheckout(true);
    setCheckoutError(null);
    try {
      await onPurchase(shippingZone, numericOffer);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : t('checkout.failed'));
      setIsStartingCheckout(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-title"
        tabIndex={-1}
      >
        <motion.div
          className={cn(
            'relative w-full h-[100dvh] max-h-[100dvh] sm:h-[90vh] sm:max-h-[90vh] sm:max-w-6xl sm:rounded-xl overflow-hidden',
            isFullscreen && 'h-full max-w-full max-h-full sm:max-w-full rounded-none'
          )}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="min-h-11 min-w-11 p-2 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
              aria-label={isFullscreen ? t('modal.exitFullscreen') : t('modal.fullscreen')}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="min-h-11 min-w-11 p-2 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
              aria-label={t('modal.close')}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(220px,40dvh)_minmax(0,1fr)] lg:grid-rows-1 lg:grid-cols-2">
            <div className="relative min-h-0 bg-black">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              )}
              <Image
                src={artwork.image}
                alt={artwork.title}
                fill
                priority
                className={cn(
                  'object-contain transition-opacity duration-500',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
            </div>

            <div className="min-h-0 bg-white dark:bg-zinc-950 p-5 sm:p-6 lg:p-10 pb-[max(1.25rem,env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain flex flex-col">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">
                    {localizedArtwork.category || t('modal.uniqueWork')}
                  </p>
                  <h2 id="artwork-title" className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-900 dark:text-white mb-4">
                    {localizedArtwork.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t('price.minimum')}</p>
                      <span className="text-xl font-semibold text-zinc-900 dark:text-white">
                        {formatPrice(artwork.price, locale)}
                      </span>
                      {usdMinimum && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {t('currency.approxShort', { amount: usdMinimum })}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full',
                        getStatusColor(artwork.status),
                        isSold && 'bg-zinc-100 dark:bg-zinc-800',
                        isReserved && 'bg-amber-50 dark:bg-amber-900/20',
                        artwork.status === 'available' && 'bg-emerald-50 dark:bg-emerald-900/20'
                      )}
                    >
                      {t(`status.${artwork.status}` as 'status.available' | 'status.sold' | 'status.reserved')}
                    </span>
                  </div>

                  {localizedArtwork.description && (
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8 text-base lg:text-lg">
                      {localizedArtwork.description}
                    </p>
                  )}

                  <div className="space-y-4 mb-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                      <Info className="w-5 h-5 text-zinc-400 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider">{t('details.dimensions')}</p>
                        <p className="text-base">{formatDimensions(artwork)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                      <Info className="w-5 h-5 text-zinc-400 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider">{t('details.technique')}</p>
                        <p className="text-base">{localizedArtwork.technique}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                      <Info className="w-5 h-5 text-zinc-400 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider">{t('details.year')}</p>
                        <p className="text-base">{artwork.year}</p>
                      </div>
                    </div>
                  </div>

                  {artwork.tags && artwork.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {artwork.tags.map((tag, index) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-full"
                        >
                          {localizedArtwork.tags?.[index] ?? tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {!isSold && !isReserved && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="offer-amount" className="block text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {t('offer.label')}
                    </label>
                    <input
                      id="offer-amount"
                      type="number"
                      min={artwork.price}
                      max="999999.99"
                      step="0.01"
                      inputMode="decimal"
                      value={offerAmount}
                      onChange={(event) => setOfferAmount(event.target.value)}
                      disabled={isStartingCheckout}
                      required
                      className="w-full min-h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 text-zinc-900 dark:text-white"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t('offer.help')}
                    </p>
                    {offerAmount && usdOffer && (
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                        {t('currency.approxShort', { amount: usdOffer })}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="shipping-zone" className="block text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {t('shipping.label')}
                    </label>
                    <select
                      id="shipping-zone"
                      value={shippingZone}
                      onChange={(event) => setShippingZone(event.target.value as ShippingZone)}
                      disabled={isStartingCheckout}
                      className="w-full min-h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 text-zinc-900 dark:text-white"
                    >
                      {Object.entries(SHIPPING_ZONES).map(([key, zone]) => (
                        <option key={key} value={key}>
                          {t(`shipping.${key}` as 'shipping.france' | 'shipping.eu' | 'shipping.world')} — {formatPrice(zone.priceCents / 100, locale)}
                          {usdPerEur ? ` (${t('currency.approxShort', { amount: formatUsdEstimate(zone.priceCents / 100, usdPerEur) ?? '' })})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t('shipping.testFees')} {t('currency.checkoutDisclaimer')}
                    </p>
                  </div>

                  {checkoutError && (
                    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                      {checkoutError}
                    </p>
                  )}

                  <motion.button
                    whileHover={{ scale: isStartingCheckout ? 1 : 1.02 }}
                    whileTap={{ scale: isStartingCheckout ? 1 : 0.98 }}
                    onClick={handlePurchase}
                    className="w-full min-h-12 py-4 px-6 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
                    disabled={isStartingCheckout || isSold || isReserved}
                  >
                    {isStartingCheckout ? (
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                    )}
                    {isStartingCheckout ? t('checkout.prepare') : t('checkout.buy')}
                  </motion.button>
                </div>
              )}

              {(isSold || isReserved) && (
                <p className="w-full py-4 px-6 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                  {isSold ? t('checkout.sold') : t('checkout.reserved')}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
