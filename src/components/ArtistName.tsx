'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function ArtistName({ className = '', size = 'default', gradient = true }: { className?: string; size?: 'default' | 'sm' | 'lg'; gradient?: boolean }) {
  const sizes = {
    sm: 'text-lg',
    default: 'text-xl lg:text-2xl',
    lg: 'text-2xl lg:text-3xl',
  };

  const baseClass = `${sizes[size]} font-light tracking-wide ${className}`;

  if (gradient) {
    return (
      <Link
        href="/"
        className={`${baseClass} relative inline-block`}
        aria-label="Accueil - Portfolio de l'artiste"
      >
        <span className="relative bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent bg-[length:200%_100%]">
          Jade Bourneuf
        </span>
        {/* Subtle shimmer effect */}
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-clip-text text-transparent bg-[length:200%_100%] -translate-x-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
          aria-hidden="true"
        >
          Jade Bourneuf
        </motion.span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={baseClass}
      aria-label="Accueil - Portfolio de l'artiste"
    >
      Jade Bourneuf
    </Link>
  );
}

// Re-export for backwards compatibility
export function ArtistNameHeader({ className = '' }: { className?: string }) {
  return <ArtistName className={className} size="default" gradient={true} />;
}

export function ArtistNameFooter({ className = '' }: { className?: string }) {
  return <ArtistName className={className} size="lg" gradient={true} />;
}