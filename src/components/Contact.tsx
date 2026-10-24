'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';

// Instagram icon component
function InstagramIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke="url(#instagramGradient)" strokeWidth="2" fill="none" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#instagramGradient)" strokeWidth="2" fill="none" />
      <circle cx="17.5" cy="6.5" r=".5" fill="url(#instagramGradient)" />
    </svg>
  );
}

export function Contact() {
  const { t } = useLocale();

  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900" aria-labelledby="contact-title">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {t('contact.label')}
            </span>
            <h2 id="contact-title" className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-900 dark:text-white mt-4">
              {t('contact.question')}<br />
              <span className="font-medium">{t('contact.write')}</span>
            </h2>
          </div>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {t('contact.intro')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl mx-auto">
            <a
              href="mailto:jade.b1@hotmail.com"
              className="group min-w-0 flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all text-left"
            >
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0">
                <Mail className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t('contact.email')}</p>
                <p className="text-sm sm:text-base text-zinc-900 dark:text-white font-medium break-all">jade.b1@hotmail.com</p>
              </div>
            </a>

            <div className="min-w-0 flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 text-left">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <MapPin className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t('contact.studio')}</p>
                <p className="text-sm sm:text-base text-zinc-900 dark:text-white font-medium break-words">{t('contact.location')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4">
            <a
              href="https://www.instagram.com/jadecommeuncailloux/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
