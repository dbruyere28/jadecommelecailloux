'use client';

import { motion } from 'framer-motion';
import { Artwork } from '@/types/artwork';
import { ArtworkCard } from './ArtworkCard';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';

interface GalleryGridProps {
  artworks: Artwork[];
  onArtworkClick: (artwork: Artwork) => void;
  className?: string;
}

export function GalleryGrid({ artworks, onArtworkClick, className }: GalleryGridProps) {
  const { t } = useLocale();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={cn('grid gap-6 lg:gap-8', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="list"
      aria-label={`${t('gallery.title1')} ${t('gallery.title2')}`}
    >
      {artworks.map((artwork, index) => (
        <motion.div key={artwork.id} variants={itemVariants} role="listitem">
          <ArtworkCard
            artwork={artwork}
            index={index}
            onClick={() => onArtworkClick(artwork)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
