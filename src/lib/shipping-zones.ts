export const SHIPPING_ZONES = {
  france: {
    label: 'France',
    priceCents: 800,
  },
  eu: {
    label: 'Union européenne (hors France)',
    priceCents: 1500,
  },
  world: {
    label: 'Reste du monde',
    priceCents: 3000,
  },
} as const;

export type ShippingZone = keyof typeof SHIPPING_ZONES;
