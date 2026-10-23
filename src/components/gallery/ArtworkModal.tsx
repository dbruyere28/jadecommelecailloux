'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { X, Maximize, Minimize, ShoppingBag, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Artwork } from '@/types/artwork';
import { formatPrice, formatDimensions, getStatusLabel, getStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ArtworkModalProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export function ArtworkModal({ artwork, isOpen, onClose, onPurchase }: ArtworkModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
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

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
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
            'relative w-full h-full max-w-6xl max-h-[90vh] mx-4 my-8 rounded-xl overflow-hidden',
            isFullscreen && 'max-w-full max-h-full mx-0 my-0 rounded-none'
          )}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
              aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            <div className="relative bg-black">
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
                sizes="50vw"
              />
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 lg:p-10 overflow-y-auto flex flex-col">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">
                    {artwork.category || 'Œuvre unique'}
                  </p>
                  <h2 id="artwork-title" className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-900 dark:text-white mb-4">
                    {artwork.title}
                  </h2>

                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xl font-semibold text-zinc-900 dark:text-white">
                      {formatPrice(artwork.price)}
                    </span>
                    <span
                      className={cn(
                        'px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full',
                        getStatusColor(artwork.status),
                        isSold && 'bg-zinc-100 dark:bg-zinc-800',
                        isReserved && 'bg-amber-50 dark:bg-amber-900/20',
                        artwork.status === 'available' && 'bg-emerald-50 dark:bg-emerald-900/20'
                      )}
                    >
                      {getStatusLabel(artwork.status)}
                    </span>
                  </div>

                  {artwork.description && (
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8 text-base lg:text-lg">
                      {artwork.description}
                    </p>
                  )}

                  <div className="space-y-4 mb-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                      <Info className="w-5 h-5 text-zinc-400 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider">Dimensions</p>
                        <p className="text-base">{formatDimensions(artwork)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                      <Info className="w-5 h-5 text-zinc-400 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider">Technique</p>
                        <p className="text-base">{artwork.technique}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                      <Info className="w-5 h-5 text-zinc-400 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider">Année</p>
                        <p className="text-base">{artwork.year}</p>
                      </div>
                    </div>
                  </div>

                  {artwork.tags && artwork.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {artwork.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {!isSold && !isReserved && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onPurchase}
                  className="w-full py-4 px-6 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                  disabled={isSold || isReserved}
                >
                  <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                  Acquérir cette œuvre
                </motion.button>
              )}

              {(isSold || isReserved) && (
                <p className="w-full py-4 px-6 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                  {isSold ? 'Cette œuvre a trouvé sa nouvelle demeure' : 'Cette œuvre est réservée'}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}