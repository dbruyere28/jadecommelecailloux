'use client';

import { motion } from 'framer-motion';
import { GradientText, FloatIn, StaggerContainer, StaggerItem } from '@/components/MagicBackground';
import { useLocale } from '@/components/LocaleProvider';

export function Hero() {
  const { t } = useLocale();

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center pt-24 lg:pt-20 overflow-hidden" aria-labelledby="hero-title">
      {/* Slow-motion video background - fills the hero without blocking the page */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/souffle-pissenlit-slow.mp4" type="video/mp4" />
        </video>
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
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[calc(100svh-6rem)] lg:min-h-[calc(100svh-5rem)]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <FloatIn direction="down" delay={0.2} className="mb-8">
          <span className="inline-block px-6 py-2 mb-8 rounded-full bg-emerald-900/30 backdrop-blur-md border border-emerald-400/30">
            <span className="text-xs font-medium uppercase tracking-widest text-emerald-200">
              {t('hero.collection')}
            </span>
          </span>
        </FloatIn>

        <StaggerContainer delay={0.4} stagger={0.15} className="mb-8">
          <StaggerItem>
            <motion.h1
              id="hero-title"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-8 leading-[1.1]"
            >
              {t('hero.where')}
              <br />
              <GradientText delay={0.1}>{t('hero.forest')}</GradientText>
            </motion.h1>
          </StaggerItem>
        </StaggerContainer>

        <FloatIn direction="up" delay={0.7} className="mb-12">
          <motion.p className="text-lg sm:text-xl lg:text-2xl font-light text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('hero.line1')} <span className="font-medium text-amber-200">{t('hero.magic')}</span>
            <br />
            {t('hero.line2')}
          </motion.p>
        </FloatIn>

        <StaggerContainer delay={0.9} stagger={0.2} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <StaggerItem>
            <motion.a
              href="#gallery"
              className="group w-full sm:w-auto px-6 sm:px-8 py-4 bg-white text-emerald-900 font-medium rounded-xl hover:bg-emerald-50 transition-colors shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('hero.gallery')}
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4-4 4m-6-12l4 4-4 4M6 12h18" />
              </svg>
            </motion.a>
          </StaggerItem>
          <StaggerItem>
            <motion.a
              href="#about"
              className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-white/10 backdrop-blur-md text-white font-medium rounded-xl border border-emerald-400/30 hover:bg-emerald-400/20 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02, borderColor: '#fde047' }}
              whileTap={{ scale: 0.98 }}
            >
              {t('hero.artist')}
            </motion.a>
          </StaggerItem>
        </StaggerContainer>
      </motion.div>

      {/* Scroll indicator - visible on all screens */}
      <FloatIn direction="up" delay={1.4} className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <motion.div 
          className="flex flex-col items-center gap-2 text-emerald-200/70"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <motion.svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </motion.svg>
          <span className="text-xs uppercase tracking-widest font-medium hidden sm:block">
            {t('hero.scroll')}
          </span>
        </motion.div>
      </FloatIn>
    </section>
  );
}
