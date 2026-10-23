'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, MessageSquare, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Contact() {
  return (
    <section id="contact" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900" aria-labelledby="contact-title">
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
              Contact
            </span>
            <h2 id="contact-title" className="text-4xl lg:text-5xl font-light tracking-tight text-zinc-900 dark:text-white mt-4">
              Une question ?<br />
              <span className="font-medium">Écrivez-moi</span>
            </h2>
          </div>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Pour toute demande d'acquisition, de commande personnalisée ou simplement pour partager
            votre propre rencontre avec la féerie, la porte est ouverte.
          </p>

          <div className="grid sm:grid-cols-[max-content_1fr] gap-6 w-full max-w-lg mx-auto">
            <a
              href="mailto:jade.bourneuf.art@gmail.com"
              className="group flex items-start gap-4 p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all text-left min-w-0"
            >
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0">
                <Mail className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Par la poste des hiboux</p>
                <p className="text-zinc-900 dark:text-white font-medium break-words">jade.bourneuf.art@gmail.com</p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 text-left min-w-0">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <MapPin className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Atelier</p>
                <p className="text-zinc-900 dark:text-white font-medium break-words">Lisière de la forêt de Brocéliande</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4">
            <a
              href="https://www.instagram.com/stories/highlights/18243671173232921/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
              aria-label="Instagram"
            >
              <MessageSquare className="w-5 h-5" aria-hidden="true" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
              aria-label="LinkedIn"
            >
              <Link className="w-5 h-5" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}