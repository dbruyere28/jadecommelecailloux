'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const navItems = [
  { href: '/', label: 'Galerie' },
  { href: '/#about', label: 'À propos' },
  { href: '/#contact', label: 'Contact' },
];

export function Header({ className }: HeaderProps) {
  return (
    <motion.header
      className={cn('fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800', className)}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link
            href="/"
            className="text-xl lg:text-2xl font-light tracking-wide text-zinc-900 dark:text-white hover:opacity-70 transition-opacity"
            aria-label="Accueil - Portfolio de l'artiste"
          >
            Jade Bourneuf
          </Link>

          <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors relative"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                whileHover={{ x: 2 }}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white scale-x-0 origin-bottom-right transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-bottom-left" />
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="hidden sm:block text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Administration
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}