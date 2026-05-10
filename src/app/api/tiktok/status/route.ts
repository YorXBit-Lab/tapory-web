import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import { getTiktokConfig } from '@/libs/tiktok';

export async function GET(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const adminSnap = await getAdminDb().collection('admins').doc(decoded.uid).get();
    if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const config = await getTiktokConfig();
    if (!config) return NextResponse.json({ connected: false });

    const tokenExpired = Date.now() / 1000 > config.expires_at;
    return NextResponse.json({
      connected: true,
      shop_id: config.shop_id,
      last_sync_at: config.last_sync_at ?? null,
      token_expired: tokenExpired,
    });
  } catch {
    return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
  }
}
