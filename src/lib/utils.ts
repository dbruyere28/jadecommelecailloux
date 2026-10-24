import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SiteLocale } from '@/lib/messages';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, locale: SiteLocale = 'fr'): string {
  const numberLocale = locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-GB';
  return new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatUsdEstimate(euroAmount: number, usdPerEur: number | null, locale: SiteLocale): string | null {
  if (!usdPerEur || !Number.isFinite(euroAmount) || !Number.isFinite(usdPerEur)) return null;
  const roundedDollars = Math.round(euroAmount * usdPerEur);
  const numberLocale = locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US';
  return new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(roundedDollars);
}

export function formatDimensions(artwork: { width: number; height: number; depth?: number }): string {
  const { width, height, depth } = artwork;
  if (depth) {
    return `${width} × ${height} × ${depth} cm`;
  }
  return `${width} × ${height} cm`;
}

export function getStatusLabel(status: 'available' | 'sold' | 'reserved'): string {
  const labels = {
    available: 'Disponible',
    sold: 'Vendu',
    reserved: 'Réservé',
  };
  return labels[status];
}

export function getStatusColor(status: 'available' | 'sold' | 'reserved'): string {
  const colors = {
    available: 'text-emerald-600 dark:text-emerald-400',
    sold: 'text-zinc-500 dark:text-zinc-400',
    reserved: 'text-amber-600 dark:text-amber-400',
  };
  return colors[status];
}
