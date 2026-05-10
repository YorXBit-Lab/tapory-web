import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import { saveTiktokConfig } from '@/libs/tiktok';

export async function POST(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const adminSnap = await getAdminDb().collection('admins').doc(decoded.uid).get();
    if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json()) as {
      access_token?: string;
      refresh_token?: string;
      shop_id?: string;
      expires_in_hours?: number;
    };

    const { access_token, refresh_token, shop_id, expires_in_hours = 24 } = body;

    if (!access_token?.trim() || !shop_id?.trim()) {
      return NextResponse.json({ error: 'Cần access_token và shop_id' }, { status: 400 });
    }

    await saveTiktokConfig({
      access_token: access_token.trim(),
      refresh_token: (refresh_token ?? '').trim(),
      shop_id: shop_id.trim(),
      expires_at: Math.floor(Date.now() / 1000) + expires_in_hours * 3600,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Lỗi hệ thống' },
      { status: 500 },
    );
  }
}
