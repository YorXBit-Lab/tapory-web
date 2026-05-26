import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/libs/firebase-admin';
import { getR2Client, R2_BUCKET } from '@/libs/r2';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  const orderId = formData.get('orderId');
  const itemIndex = Number(formData.get('itemIndex'));
  const slotIndex = Number(formData.get('slotIndex'));
  const sideRaw = formData.get('side');
  const side = sideRaw === 'b' ? 'b' : sideRaw === 'a' ? 'a' : undefined;

  if (!(file instanceof File)) return NextResponse.json({ error: 'Thiếu file' }, { status: 400 });
  if (!orderId || typeof orderId !== 'string') return NextResponse.json({ error: 'Thiếu orderId' }, { status: 400 });
  if (isNaN(itemIndex) || isNaN(slotIndex)) return NextResponse.json({ error: 'itemIndex/slotIndex không hợp lệ' }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Chỉ chấp nhận JPEG, PNG, WebP' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'File quá lớn (tối đa 10 MB)' }, { status: 400 });
  }

  // Validate order exists
  const db = getAdminDb();
  const orderSnap = await db.collection('orders').doc(orderId).get();
  if (!orderSnap.exists) return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const sideSegment = side ? `-${side}` : '';
  const key = `print-photos/${orderId}/${itemIndex}-${slotIndex}${sideSegment}-${Date.now()}.${ext}`;

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
    console.error('[upload-print-photo] R2 error:', err);
    return NextResponse.json({ error: 'Upload thất bại' }, { status: 500 });
  }

  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) return NextResponse.json({ error: 'R2 URL chưa cấu hình' }, { status: 500 });

  const url = `${publicUrl.replace(/\/$/, '')}/${key}`;

  // Save to order document
  const slotDoc: Record<string, unknown> = {
    itemIndex,
    slotIndex,
    url,
    uploadedAt: new Date().toISOString(),
  };
  if (side) slotDoc.side = side;

  await db.collection('orders').doc(orderId).update({
    printPhotos: FieldValue.arrayUnion(slotDoc),
    updatedAt: new Date(),
  });

  return NextResponse.json({ url, key });
}
