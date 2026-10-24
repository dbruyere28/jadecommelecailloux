'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArtistNameFooter } from '@/components/ArtistName';
import { useLocale } from '@/components/LocaleProvider';

export function Footer() {
  const { t } = useLocale();
  const currentYear = new Date().getFullYear();

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
            <ArtistNameFooter aria-label="Accueil" />
            <p className="text-emerald-300 text-base leading-relaxed max-w-xs">{t('footer.bio')}</p>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            aria-label={t('footer.navigation')}
          >
            <h3 className="text-xs font-medium uppercase tracking-widest text-emerald-300 mb-4">{t('footer.navigation')}</h3>
            <ul className="space-y-3">
              {[
                { label: t('nav.gallery'), href: '/#gallery' },
                { label: t('nav.about'), href: '/#about' },
                { label: t('nav.contact'), href: '/#contact' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-emerald-200 hover:text-white transition-colors text-sm"
                  >
                    {item.label}
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
            <h3 className="text-xs font-medium uppercase tracking-widest text-emerald-300">{t('footer.legal')}</h3>
            <ul className="space-y-3 text-sm text-emerald-300">
              <li>{t('footer.legalNotice')}</li>
              <li>{t('footer.privacy')}</li>
              <li>{t('footer.terms')}</li>
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
            © {currentYear} Jade Bourneuf. {t('footer.rights')}
          </p>
          <p className="text-emerald-400 text-sm">
            {t('footer.madeWith')}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
