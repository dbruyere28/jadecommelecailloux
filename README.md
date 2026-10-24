This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Paiements Stripe (mode test)

Le site utilise Stripe Checkout avec des clés de test uniquement. Le prix minimum de chaque œuvre est lu côté serveur depuis Upstash KV ; l’acheteur peut proposer un montant supérieur, que le serveur vérifie avant de créer le paiement. Une œuvre est réservée pendant le paiement, puis marquée vendue par le webhook Stripe après confirmation.

Variables à configurer dans `.env.local` pour le développement et dans les paramètres Vercel pour l’environnement de test :

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Dans le tableau de bord Stripe en mode test, crée un webhook vers `https://TON-DOMAINE/api/stripe/webhook` et active les événements `checkout.session.completed` et `checkout.session.expired`. Pour tester en local avec Stripe CLI :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Utilise la clé `whsec_...` affichée par la commande comme `STRIPE_WEBHOOK_SECRET`. Une carte de test Stripe courante est `4242 4242 4242 4242` (date future et CVC quelconque).

Les frais de livraison proposés pour les essais sont provisoires : France 8 €, Union européenne hors France 15 €, reste du monde 30 €. Les clés `sk_live_` sont volontairement refusées ; avant tout encaissement réel, il faudra valider les tarifs, la configuration de livraison et le passage explicite en mode live.

Les œuvres peuvent être traduites automatiquement en anglais et en allemand avec DeepL. Configure `DEEPL_AUTH_KEY` comme variable serveur (sans préfixe `NEXT_PUBLIC_`) dans Vercel, puis redéploie. Les nouvelles œuvres et les modifications de leurs textes seront traduites à l’enregistrement ; le bouton **Traduire les œuvres existantes** dans l’administration permet de compléter les traductions déjà manquantes. Les textes français restent la source de référence et les traductions sont enregistrées dans Upstash KV.

## Mode maintenance

Le mode maintenance se règle dans **Administration → Mode maintenance** et son état est stocké dans Upstash KV. Quand il est activé, le site demande le mot de passe défini par `MAINTENANCE_PASSWORD`. L’accès est mémorisé uniquement dans le navigateur qui a saisi ce mot de passe (cookie sécurisé de 12 heures) ; le bouton d’administration reste le seul moyen de désactiver la maintenance pour tout le monde. Configure ce mot de passe comme variable d’environnement dans Vercel avant d’activer le mode.
