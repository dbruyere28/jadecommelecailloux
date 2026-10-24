'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Artwork } from '@/types/artwork';
import { formatPrice, formatDimensions, getStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';

interface ArtworkCardProps {
  artwork: Artwork;
  index: number;
  onClick: () => void;
}

export function ArtworkCard({ artwork, index, onClick }: ArtworkCardProps) {
  const { locale, t } = useLocale();
  const isSold = artwork.status === 'sold';
  const isReserved = artwork.status === 'reserved';

  return (
    <motion.article
      className="group min-w-0 cursor-pointer touch-manipulation"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      aria-label={isSold ? `${artwork.title}, ${t('status.sold')}` : isReserved ? `${artwork.title}, ${t('status.reserved')}` : t('card.view', { title: artwork.title })}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={artwork.thumbnail || artwork.image}
          alt={artwork.title}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-105"
          sizes="(max-width: 359px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
        {(isSold || isReserved) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center" aria-hidden="true">
            <span className={cn(
              'px-4 py-2 text-sm font-medium uppercase tracking-wider rounded-full backdrop-blur-sm',
              isSold
                ? 'bg-white/90 text-zinc-900'
                : 'bg-amber-100/90 text-amber-900'
            )}>
              {t(`status.${artwork.status}` as 'status.available' | 'status.sold' | 'status.reserved')}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
      </div>

      <div className="mt-3 sm:mt-4 space-y-2 min-w-0">
        <h3 className="text-base sm:text-lg font-medium text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors break-words">
          {artwork.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          <span>{formatDimensions(artwork)}</span>
          <span aria-hidden="true">·</span>
          <span className="min-w-0 break-words">{artwork.technique}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white">
            {t('price.from')} {formatPrice(artwork.price, locale)}
          </span>
          <span
            className={cn(
              'text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full',
              getStatusColor(artwork.status),
              isSold && 'bg-zinc-100 dark:bg-zinc-800',
              isReserved && 'bg-amber-50 dark:bg-amber-900/20',
              artwork.status === 'available' && 'bg-emerald-50 dark:bg-emerald-900/20'
            )}
          >
            {t(`status.${artwork.status}` as 'status.available' | 'status.sold' | 'status.reserved')}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
