import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import { getR2Client, R2_BUCKET } from '@/libs/r2';

export async function DELETE(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = (await req.json()) as { key?: string };
  const key = body.key ?? '';

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);

    if (decoded.uid.startsWith('card_')) {
      const cardId = decoded.uid.slice('card_'.length);
      if (!key.startsWith(`memorials/${cardId}/`)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Admin — verify admin status, allow any memorials/ key
      const adminSnap = await getAdminDb().collection('admins').doc(decoded.uid).get();
      if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      if (!key.startsWith('memorials/')) {
        return NextResponse.json({ error: 'Key không hợp lệ' }, { status: 400 });
      }
    }
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    await getR2Client().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn('[card/delete-image]', err);
    return NextResponse.json({ ok: true }); // best-effort
  }
}
