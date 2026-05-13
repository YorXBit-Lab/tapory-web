import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import { getR2Client, R2_BUCKET } from '@/libs/r2';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file');
  const requestedCardId = (formData.get('cardId') as string | null)?.trim() ?? '';

  if (!(file instanceof File)) return NextResponse.json({ error: 'Thiếu file' }, { status: 400 });

  let cardId: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);

    if (decoded.uid.startsWith('card_')) {
      // Customer token — cardId encoded in UID
      cardId = decoded.uid.slice('card_'.length);
    } else {
      // Admin token — verify admin status, use cardId from form data
      const adminSnap = await getAdminDb().collection('admins').doc(decoded.uid).get();
      if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      if (!requestedCardId) return NextResponse.json({ error: 'Thiếu cardId' }, { status: 400 });
      cardId = requestedCardId;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Chỉ chấp nhận JPEG, PNG, WebP, GIF' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'File quá lớn (tối đa 5 MB)' }, { status: 400 });
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const key = `memorials/${cardId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
  } catch (err) {
    console.error('[card/upload-image] R2 error:', err);
    return NextResponse.json({ error: 'Upload thất bại' }, { status: 500 });
  }

  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) return NextResponse.json({ error: 'R2 chưa cấu hình' }, { status: 500 });

  return NextResponse.json({ url: `${publicUrl.replace(/\/$/, '')}/${key}`, key });
}
