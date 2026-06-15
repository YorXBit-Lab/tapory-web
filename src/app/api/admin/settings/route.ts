import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
// import { DEFAULT_NFC_EXTRA_PRICE } from '@/configs/constants';

async function verifyAdmin(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const db = getAdminDb();
    const snap = await db.collection('admins').doc(decoded.uid).get();
    if (!snap.exists) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const db = getAdminDb();
  const snap = await db.collection('settings').doc('global').get();
  // const data = snap.exists ? snap.data() : { nfcExtraPrice: DEFAULT_NFC_EXTRA_PRICE };
  const data = snap.exists ? snap.data() : {};

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 });
  }

  // Whitelist các field được phép update
  const allowed: (keyof typeof body)[] = ['brand', 'contact', 'social', 'seo', 'nfcExtraPrice'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: 'Không có field hợp lệ' }, { status: 400 });
  }

  const db = getAdminDb();
  await db.collection('settings').doc('global').set(update, { merge: true });
  return NextResponse.json({ ok: true });
}
