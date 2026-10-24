'use client';

import { FormEvent, useState } from 'react';
import { KeyRound, Loader2, Sparkles } from 'lucide-react';

interface MaintenanceGateProps {
  onUnlock: () => void;
  accessConfigured: boolean;
}

export function MaintenanceGate({ onUnlock, accessConfigured }: MaintenanceGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlock', password }),
      });
      const data: { error?: string } = await response.json();

      if (!response.ok) throw new Error(data.error || 'Impossible de vérifier le mot de passe.');
      onUnlock();
    } catch (unlockError) {
      setError(unlockError instanceof Error ? unlockError.message : 'Une erreur est survenue. Réessayez.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100svh] flex items-center justify-center bg-zinc-950 px-4 py-12 text-white">
      <section className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-emerald-200">
          <Sparkles className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-emerald-200">Un instant de magie</p>
        <h1 className="font-serif text-4xl font-light tracking-tight sm:text-5xl">La forêt se prépare</h1>
        <p className="mx-auto mt-5 max-w-sm leading-relaxed text-zinc-300">
          Le site est momentanément en maintenance. Si tu as le mot de passe, la porte est juste ici.
        </p>

        {accessConfigured ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
            <label htmlFor="maintenance-password" className="sr-only">Mot de passe de maintenance</label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                id="maintenance-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Mot de passe"
                required
                className="min-h-12 w-full rounded-xl border border-white/15 bg-white/5 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/30"
              />
            </div>
            {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-200 px-6 font-medium text-emerald-950 transition-colors hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Entrer dans la galerie
            </button>
          </form>
        ) : (
          <p className="mt-8 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100" role="alert">
            L’accès n’est pas encore configuré. Réessaie un peu plus tard.
          </p>
        )}
      </section>
    </main>
  );
}
