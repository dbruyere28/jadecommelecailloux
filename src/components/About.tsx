'use client';

import { motion } from 'framer-motion';

export function About() {
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
              À propos
            </span>
            <h2 id="about-title" className="text-4xl lg:text-5xl font-light tracking-tight text-zinc-900 dark:text-white">
              Une vie tissée de
              <br />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">féerie et de forêts</span>
            </h2>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-lg leading-relaxed">
            <p>
              Née à <strong>Dreux en 2002</strong>, Jade Bourneuf grandit entre les contes de sa grand-mère
              et les forêts d&apos;Île-de-France. Très tôt, elle comprend que la peinture n&apos;est pas un art :
              c&apos;est une façon de garder les portes ouvertes entre les mondes.
            </p>
            <p>
              Son travail naît au carrefour des contes oubliés, de la botanique mystique et des grimoires
              transmis de génération en génération. Sorcières gardiennes, arbres-mondes, lucioles messagères :
              chaque toile est un fragment de cet ailleurs qui frôle notre réalité.
            </p>
            <p>
              Autodidacte, elle mêle pigments naturels, encres végétales et feuilles d&apos;or sur bois
              et toile brute.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
