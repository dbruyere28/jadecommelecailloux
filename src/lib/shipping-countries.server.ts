import 'server-only';

import countries from 'i18n-iso-countries';
import { ShippingZone } from '@/lib/shipping-zones';

const EUROPEAN_UNION_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);
const UNSUPPORTED_STRIPE_COUNTRIES = new Set([
  'AS', 'CC', 'CU', 'CX', 'FM', 'HM', 'IR', 'KP', 'MH', 'MP', 'NF', 'PW', 'SY', 'UM', 'VI',
]);

export function getAllowedShippingCountries(zone: ShippingZone): string[] {
  const allCountryCodes = Object.keys(countries.getAlpha2Codes()).filter(
    (code) => !UNSUPPORTED_STRIPE_COUNTRIES.has(code)
  );

  if (zone === 'france') return ['FR'];
  if (zone === 'eu') {
    return allCountryCodes.filter((code) => EUROPEAN_UNION_COUNTRIES.has(code) && code !== 'FR');
  }

  return allCountryCodes.filter((code) => !EUROPEAN_UNION_COUNTRIES.has(code));
}
