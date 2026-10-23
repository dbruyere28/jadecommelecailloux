'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { ArtworkModal } from '@/components/gallery/ArtworkModal';
import { artworks, getAvailableArtworks } from '@/data/artworks';
import { Artwork } from '@/types/artwork';

const STORAGE_KEY = 'artworks_catalog';

export default function Home() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localArtworks, setLocalArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLocalArtworks(JSON.parse(stored));
      } catch {
        setLocalArtworks([]);
      }
    }
  }, []);

  // Combine static artworks with localStorage artworks (avoid duplicates by id)
  const allArtworks = [...artworks, ...localArtworks.filter(a => !artworks.some(oa => oa.id === a.id))];
  const availableArtworks = allArtworks.filter(a => a.status === 'available');

  const handleArtworkClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  const handlePurchase = () => {
    if (selectedArtwork) {
      window.location.href = `/api/checkout?artworkId=${selectedArtwork.id}`;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white antialiased">
      <Header />

      <main id="main-content">
        <Hero />

        <section id="gallery" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900" aria-labelledby="gallery-title">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
            >
              <span className="text-xs font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
                Collection actuelle
              </span>
              <h2 id="gallery-title" className="text-4xl lg:text-5xl font-light tracking-tight text-zinc-900 dark:text-white mt-4 mb-6">
                Œuvres
                <br />
                <span className="font-medium">disponibles</span>
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Chaque pièce est unique, signée et accompagnée de son certificat d'authenticité.
                Prix unique : <strong className="text-zinc-900 dark:text-white">50 €</strong>.
              </p>
            </motion.div>

            <GalleryGrid
              artworks={availableArtworks}
              onArtworkClick={handleArtworkClick}
              className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            />

            {availableArtworks.length === 0 && (
              <div className="text-center py-16">
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                  Aucune œuvre disponible pour le moment. Revenez bientôt pour découvrir les nouvelles créations.
                </p>
              </div>
            )}
          </div>
        </section>

        <About />
        <Contact />
      </main>

      <Footer />

      <ArtworkModal
        artwork={selectedArtwork}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPurchase={handlePurchase}
      />
    </div>
  );
}