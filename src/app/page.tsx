'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { ArtworkModal } from '@/components/gallery/ArtworkModal';
import { Artwork } from '@/types/artwork';
import { cn } from '@/lib/utils';
import { ShippingZone } from '@/lib/shipping-zones';
import { MaintenanceGate } from '@/components/MaintenanceGate';

export default function Home() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [maintenanceAccess, setMaintenanceAccess] = useState<'checking' | 'open' | 'locked' | 'error'>('checking');
  const [maintenanceAccessConfigured, setMaintenanceAccessConfigured] = useState(false);

  const requestArtworks = useCallback(async () => {
    const response = await fetch('/api/artworks', { cache: 'no-store' });
    const data: { artworks?: Artwork[]; error?: string } = await response.json();
    if (!response.ok || !Array.isArray(data.artworks)) {
      throw new Error(data.error || 'Impossible de charger la galerie.');
    }
    return data.artworks;
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/maintenance', { cache: 'no-store' })
      .then(async (response) => {
        const data: { maintenanceEnabled?: boolean; authorized?: boolean; accessConfigured?: boolean; error?: string } = await response.json();
        if (!response.ok) throw new Error(data.error || 'Impossible de vérifier le mode maintenance.');
        return data;
      })
      .then(async (status) => {
        if (!isMounted) return;
        setMaintenanceAccessConfigured(status.accessConfigured === true);

        if (status.maintenanceEnabled && !status.authorized) {
          setMaintenanceAccess('locked');
          return;
        }

        setMaintenanceAccess('open');
        try {
          setArtworks(await requestArtworks());
        } catch (error) {
          console.error('Error loading artworks:', error);
          if (isMounted) setLoadError('La galerie est momentanément indisponible. Réessayez dans quelques instants.');
        }
      })
      .catch((error: unknown) => {
        console.error('Error checking maintenance mode:', error);
        if (isMounted) setMaintenanceAccess('error');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [requestArtworks]);

  const loadArtworks = useCallback(async () => {
    try {
      setArtworks(await requestArtworks());
    } catch (error) {
      console.error('Error loading artworks:', error);
      setLoadError('La galerie est momentanément indisponible. Réessayez dans quelques instants.');
    } finally {
      setIsLoading(false);
    }
  }, [requestArtworks]);

  const handleArtworkClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  const handlePurchase = async (shippingZone: ShippingZone) => {
    if (!selectedArtwork) throw new Error('Aucune œuvre sélectionnée.');

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artworkId: selectedArtwork.id, shippingZone }),
    });
    const data: { url?: string; error?: string } = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || 'Impossible de préparer le paiement. Réessayez.');
    }

    window.location.assign(data.url);
  };

  const handleRefreshGallery = () => {
    setIsLoading(true);
    setLoadError(null);
    loadArtworks();
  };

  const handleMaintenanceUnlock = () => {
    setMaintenanceAccess('open');
    setIsLoading(true);
    setLoadError(null);
    loadArtworks();
  };

  if (maintenanceAccess === 'checking') {
    return (
      <main className="min-h-[100svh] flex items-center justify-center bg-zinc-950 text-emerald-200" aria-busy="true">
        <Loader2 className="h-8 w-8 animate-spin" aria-label="Vérification de l’accès au site" />
      </main>
    );
  }

  if (maintenanceAccess === 'locked') {
    return (
      <MaintenanceGate
        accessConfigured={maintenanceAccessConfigured}
        onUnlock={handleMaintenanceUnlock}
      />
    );
  }

  if (maintenanceAccess === 'error') {
    return (
      <main className="min-h-[100svh] flex items-center justify-center bg-zinc-950 px-4 text-center text-white">
        <div className="max-w-md space-y-5">
          <h1 className="text-3xl font-light">La galerie est momentanément inaccessible</h1>
          <p className="text-zinc-300">Impossible de vérifier l’état du site. Réessaie dans quelques instants.</p>
          <button onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-emerald-200 px-6 font-medium text-emerald-950">
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white antialiased">
      <Header />

      <main id="main-content">
        <Hero />

        <section id="gallery" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900" aria-labelledby="gallery-title">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20"
            >
              <span className="text-xs font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
                Collection actuelle
              </span>
              <h2 id="gallery-title" className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-900 dark:text-white mt-4 mb-5 sm:mb-6">
                Œuvres
                <br />
                <span className="font-medium">disponibles</span>
              </h2>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Chaque pièce est unique et signée.
              </p>
            </motion.div>

            <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {loadError
                  ? 'Galerie momentanément indisponible'
                  : `${artworks.length} œuvre${artworks.length > 1 ? 's' : ''} disponible${artworks.length > 1 ? 's' : ''}`}
              </p>
              <button
                onClick={handleRefreshGallery}
                disabled={isLoading}
                className={cn(
                  'inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2 text-sm font-medium rounded-xl transition-colors',
                  'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
                  'hover:bg-zinc-200 dark:hover:bg-zinc-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Rafraîchir la galerie"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                )}
                Rafraîchir
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:gap-6 lg:gap-8 lg:grid-cols-3 xl:grid-cols-4" role="list" aria-label="Galerie d'œuvres">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse" role="listitem">
                    <div className="aspect-[4/3] rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                    <div className="mt-4 space-y-2">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {loadError && (
                  <div className="py-12 text-center" role="alert">
                    <p className="text-zinc-700 dark:text-zinc-300 text-base sm:text-lg mb-2">
                      {loadError}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Le service de stockage des œuvres n&apos;a pas répondu correctement.
                    </p>
                  </div>
                )}

                {artworks.length > 0 && (
                  <GalleryGrid
                    artworks={artworks}
                    onArtworkClick={handleArtworkClick}
                    className="grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4"
                  />
                )}

                {artworks.length === 0 && !loadError && (
                  <div className="text-center py-16">
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-4">
                      Aucune œuvre disponible pour le moment.
                    </p>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
                      Les œuvres sont synchronisées via le cloud. Ajoutez vos œuvres via l&apos;
                      <a href="/admin" className="underline hover:text-emerald-500">administration</a>
                      {' '}ou rafraîchissez la galerie après en avoir ajouté.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <About />
        <Contact />
      </main>

      <Footer />

      {isModalOpen && selectedArtwork && (
        <ArtworkModal
          key={selectedArtwork.id}
          artwork={selectedArtwork}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPurchase={handlePurchase}
        />
      )}
    </div>
  );
}
