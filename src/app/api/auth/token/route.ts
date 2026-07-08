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
    const snap = await adminDb.doc(`cardAuth/${cardId}`).get();

    if (!snap.exists) {
      return NextResponse.json({ message: 'Thẻ không tồn tại hoặc chưa được kích hoạt' }, { status: 404 });
    }

    const data = snap.data()!;

    if (data.lockedUntil && data.lockedUntil.toDate() > new Date()) {
      return NextResponse.json(
        { message: 'Quá nhiều lần thử sai. Vui lòng thử lại sau 15 phút.' },
        { status: 429 },
      );
    }

    const phoneOk = (await hashPhone(phone)) === data.phoneHash;

    if (!phoneOk) {
      const attempts = (data.failedAttempts ?? 0) + 1;
      const update: Record<string, unknown> = { failedAttempts: attempts };
      if (attempts >= 5) update.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await adminDb.doc(`cardAuth/${cardId}`).update(update);
      return NextResponse.json({ message: 'Số điện thoại không đúng' }, { status: 401 });
    }

    await adminDb.doc(`cardAuth/${cardId}`).update({ failedAttempts: 0, lockedUntil: null });

    const token = await getAdminAuth().createCustomToken(`card_${cardId}`, {
      cardId,
      role: 'card_owner',
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error('[auth/token]', err);
    return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
  }
}
