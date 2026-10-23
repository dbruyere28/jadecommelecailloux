'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MagicBackground, FloatingOrbs, FloatingSparkles } from '@/components/MagicBackground';
import { cn } from '@/lib/utils';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 lg:pt-20 overflow-hidden" aria-labelledby="hero-title">
      {/* Magical animated background */}
      <div className="absolute inset-0 z-0">
        <MagicBackground />
        <FloatingOrbs />
        <FloatingSparkles />
        
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-900/40 to-amber-950/60" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" aria-hidden="true" />
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />
      </div>

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          className="inline-block px-6 py-2 mb-8 rounded-full bg-emerald-900/30 backdrop-blur-md border border-emerald-400/30"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-emerald-200">
            Collection Féerie 2026
          </span>
        </motion.div>

        <motion.h1
          id="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white mb-8 leading-[1.1]"
        >
          Là où
          <br />
          <span className="font-medium text-emerald-200">la forêt rêve</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
          className="text-lg sm:text-xl lg:text-2xl font-light text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Entre les branches, <span className="font-medium text-amber-200">la magie veille</span>.
          <br />
          Chaque toile ouvre un passage vers l'invisible.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#gallery"
            className="group px-8 py-4 bg-white text-emerald-900 font-medium rounded-xl hover:bg-emerald-50 transition-colors shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
          >
            Entrer dans la galerie
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4-4 4m-6-12l4 4-4 4M6 12h18" />
            </svg>
          </a>
          <a
            href="#about"
            className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-medium rounded-xl border border-emerald-400/30 hover:bg-emerald-400/20 transition-colors flex items-center justify-center gap-2"
          >
            Connaître l'artiste
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        aria-hidden="true"
      >
        <svg className="w-6 h-6 text-emerald-200/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}