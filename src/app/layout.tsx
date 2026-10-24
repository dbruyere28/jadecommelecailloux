import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { LocaleProvider } from '@/components/LocaleProvider';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Jade Bourneuf — Artiste de la Féerie | Galerie des Mondes Invisibles',
    template: '%s | Jade Bourneuf',
  },
  description: 'Découvrez l\'univers féerique de Jade Bourneuf. Œuvres uniques entre sorcières, forêts enchantées et magie ancestrale. Acquisitions en ligne sécurisées.',
  keywords: ['artiste féerie', 'galerie art magique', 'peinture sorcières', 'art forêt enchantée', 'achat art fantastique', 'art visionnaire', 'mondes invisibles'],
  authors: [{ name: 'Jade Bourneuf' }],
  creator: 'Jade Bourneuf',
  publisher: 'Jade Bourneuf',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://jade-bourneuf.art',
    siteName: 'Jade Bourneuf — Artiste de la Féerie',
    title: 'Jade Bourneuf — Artiste de la Féerie | Galerie des Mondes Invisibles',
    description: 'Découvrez l\'univers féerique de Jade Bourneuf. Œuvres uniques entre sorcières, forêts enchantées et magie ancestrale.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Jade Bourneuf - Artiste de la Féerie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jade Bourneuf — Artiste de la Féerie',
    description: 'Découvrez l\'univers féerique de Jade Bourneuf. Œuvres uniques entre sorcières, forêts enchantées et magie ancestrale.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0fdf4' },
    { media: '(prefers-color-scheme: dark)', color: '#052e16' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
