import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

export const MAINTENANCE_KEY = 'site_maintenance_enabled';
export const MAINTENANCE_ACCESS_COOKIE = 'site_maintenance_access';
export const MAINTENANCE_ACCESS_MAX_AGE = 60 * 60 * 12;

export function secureStringEqual(value: unknown, expected: string) {
  if (typeof value !== 'string') return false;
  const actualBytes = Buffer.from(value, 'utf8');
  const expectedBytes = Buffer.from(expected, 'utf8');
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

export function createMaintenanceAccessToken() {
  const password = process.env.MAINTENANCE_PASSWORD;
  if (!password) return null;
  return createHmac('sha256', password).update('site-maintenance-access-v1').digest('hex');
}

export function hasMaintenanceAccess(cookieValue?: string) {
  const expectedToken = createMaintenanceAccessToken();
  return Boolean(expectedToken && secureStringEqual(cookieValue, expectedToken));
}
