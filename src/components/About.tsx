'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function About() {
  return (
    <section id="about" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950" aria-labelledby="about-title">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Image
              src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=80"
              alt="Jade Bourneuf dans son atelier forestier"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="space-y-8">
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
                et les forêts d'Île-de-France. Très tôt, elle comprend que la peinture n'est pas un art :
                c'est une façon de garder les portes ouvertes entre les mondes.
              </p>
              <p>
                Son travail naît au carrefour des contes oubliés, de la botanique mystique et des grimoires
                transmis de génération en génération. Sorcières gardiennes, arbres-mondes, lucioles messagères :
                chaque toile est un fragment de cet ailleurs qui frôle notre réalité.
              </p>
              <p>
                Autodidacte, elle mêle pigments naturels, encres végétales et feuilles d'or sur bois
                et toile brute. Exposée dans des galeries spécialisées en art visionnaire à Paris,
                Édimbourg et Montréal, elle vit aujourd'hui en lisière de forêt, où son atelier
                n'a d'autres murs que les troncs d'hêtres centenaires.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              {[
                { value: '12+', label: 'Années de pratique' },
                { value: '30+', label: 'Expositions' },
                { value: '8', label: 'Pays collectionneurs' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl lg:text-4xl font-light text-zinc-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wide">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}