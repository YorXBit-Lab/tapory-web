import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import { testConnection } from '@/libs/tiktok';

export async function GET(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const adminSnap = await getAdminDb().collection('admins').doc(decoded.uid).get();
    if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await testConnection();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Lỗi không xác định' },
      { status: 500 },
    );
  }
}
