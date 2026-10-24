'use client';

import { motion } from 'framer-motion';
import { useLocale } from '@/components/LocaleProvider';

export function About() {
  const { t } = useLocale();

  return (
    <section id="about" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950" aria-labelledby="about-title">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="max-w-3xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-4">
            <span className="text-xs font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {t('about.label')}
            </span>
            <h2 id="about-title" className="text-4xl lg:text-5xl font-light tracking-tight text-zinc-900 dark:text-white">
              {t('about.heading1')}
              <br />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{t('about.heading2')}</span>
            </h2>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-lg leading-relaxed">
              <p>{t('about.bio1')}</p>
              <p>{t('about.bio2')}</p>
              <p>{t('about.bio3')}</p>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-zinc-900 dark:text-white">
              {t('about.legendTitle')}
            </h3>
            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
              <p>{t('about.legend1')}</p>
              <p>{t('about.legend2')}</p>
              <p>{t('about.legend3')}</p>
              <p className="font-medium text-emerald-700 dark:text-emerald-300">
                {t('about.legend4')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
