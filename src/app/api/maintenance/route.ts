import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import {
  createMaintenanceAccessToken,
  hasMaintenanceAccess,
  MAINTENANCE_ACCESS_COOKIE,
  MAINTENANCE_ACCESS_MAX_AGE,
  MAINTENANCE_KEY,
  secureStringEqual,
} from '@/lib/maintenance-auth.server';

export async function GET(request: NextRequest) {
  try {
    const maintenanceEnabled = await kv.get<boolean>(MAINTENANCE_KEY);
    const cookieToken = request.cookies.get(MAINTENANCE_ACCESS_COOKIE)?.value;

    return NextResponse.json(
      {
        maintenanceEnabled: maintenanceEnabled === true,
        authorized: hasMaintenanceAccess(cookieToken),
        accessConfigured: Boolean(createMaintenanceAccessToken()),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Erreur de lecture du mode maintenance:', error);
    return NextResponse.json({ error: 'Impossible de vérifier le mode maintenance.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  let body: { action?: unknown; password?: unknown; enabled?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  if (body.action === 'unlock') {
    const expectedPassword = process.env.MAINTENANCE_PASSWORD;
    if (!expectedPassword) {
      return NextResponse.json({ error: 'Le mot de passe de maintenance n’est pas configuré.' }, { status: 503 });
    }
    if (!secureStringEqual(body.password, expectedPassword)) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
    }

    const token = createMaintenanceAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Le mot de passe de maintenance n’est pas configuré.' }, { status: 503 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(MAINTENANCE_ACCESS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAINTENANCE_ACCESS_MAX_AGE,
    });
    return response;
  }

  if (body.action === 'set') {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ error: 'Le mot de passe administrateur n’est pas configuré.' }, { status: 503 });
    }
    if (!secureStringEqual(body.password, adminPassword)) {
      return NextResponse.json({ error: 'Authentification administrateur invalide.' }, { status: 401 });
    }
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json({ error: 'État de maintenance invalide.' }, { status: 400 });
    }

    try {
      await kv.set(MAINTENANCE_KEY, body.enabled);
      return NextResponse.json({ success: true, maintenanceEnabled: body.enabled });
    } catch (error) {
      console.error('Erreur de mise à jour du mode maintenance:', error);
      return NextResponse.json({ error: 'Impossible de modifier le mode maintenance.' }, { status: 503 });
    }
  }

  return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 });
}
