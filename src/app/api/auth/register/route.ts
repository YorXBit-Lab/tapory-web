import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import { hashPhone } from '@/utils/phone';

export async function POST(req: NextRequest) {
  try {
    const { cardId, phone } = await req.json();

    if (!cardId || !phone) {
      return NextResponse.json({ message: 'Thiếu thông tin' }, { status: 400 });
    }

    const adminDb = getAdminDb();

    // Only allow registration for cards created by admin
    const cardSnap = await adminDb.doc(`cards/${cardId}`).get();
    if (!cardSnap.exists) {
      return NextResponse.json({ message: 'Thẻ không tồn tại' }, { status: 404 });
    }

    const snap = await adminDb.doc(`cardAuth/${cardId}`).get();

    if (snap.exists) {
      return NextResponse.json(
        { message: 'Thẻ này đã có mật khẩu. Vui lòng nhập SĐT đã đặt trước đó.' },
        { status: 409 },
      );
    }

    const now = new Date();
    await adminDb.doc(`cardAuth/${cardId}`).set({
      phoneHash: await hashPhone(phone),
      failCount: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    });

    const token = await getAdminAuth().createCustomToken(`card_${cardId}`, {
      cardId,
      role: 'card_owner',
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error('[auth/register]', err);
    return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
  }
}
