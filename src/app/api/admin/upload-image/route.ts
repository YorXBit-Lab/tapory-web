import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getAdminAuth } from '@/libs/firebase-admin';
import { getR2Client, R2_BUCKET } from '@/libs/r2';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  // Auth check
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const adminDb = (await import('@/libs/firebase-admin')).getAdminDb();
    const adminSnap = await adminDb.collection('admins').doc(decoded.uid).get();
    if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Parse multipart form
  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Thiếu file' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Chỉ chấp nhận JPEG, PNG, WebP, GIF' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'File quá lớn (tối đa 5 MB)' }, { status: 400 });
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const key = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

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
    console.error('[upload-image] R2 error:', err);
    return NextResponse.json({ error: 'Upload thất bại' }, { status: 500 });
  }

  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_R2_PUBLIC_URL chưa được cấu hình' }, { status: 500 });
  }

  return NextResponse.json({ url: `${publicUrl.replace(/\/$/, '')}/${key}`, key });
}
