'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-emerald-950/50 dark:bg-emerald-950/50 text-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/30" role="contentinfo">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Link href="/" className="text-2xl lg:text-3xl font-light tracking-wide hover:opacity-70 transition-opacity text-emerald-200" aria-label="Accueil">
              Jade Bourneuf
            </Link>
            <p className="text-emerald-300 text-base leading-relaxed max-w-xs">
              Artiste de la féerie. Gardienne des portes entre les mondes. Peint l'invisible au creux des forêts anciennes.
            </p>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            aria-label="Navigation pied de page"
          >
            <h3 className="text-xs font-medium uppercase tracking-widest text-emerald-300 mb-4">Navigation</h3>
            <ul className="space-y-3">
              {['Galerie', 'À propos', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={item === 'Galerie' ? '/' : item === 'À propos' ? '/#about' : '/#contact'}
                    className="text-emerald-200 hover:text-white transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-xs font-medium uppercase tracking-widest text-emerald-300">Légal</h3>
            <ul className="space-y-3 text-sm text-emerald-300">
              <li>Mentions légales</li>
              <li>Politique de confidentialité</li>
              <li>CGV</li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 lg:mt-16 pt-8 border-t border-emerald-900/30 flex flex-col lg:flex-row items-center justify-between gap-4"
        >
          <p className="text-emerald-400 text-sm">
            © {currentYear} Jade Bourneuf. Tous droits réservés.
          </p>
          <p className="text-emerald-400 text-sm">
            Site réalisé avec Next.js, Tailwind CSS & Framer Motion
          </p>
        </motion.div>
      </div>
    </footer>
  );
}