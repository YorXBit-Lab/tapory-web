import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/libs/firebase-admin';
import { hashPhone } from '@/utils/phone';

export async function POST(req: NextRequest) {
  try {
    const { cardId, currentPhone, newPhone } = await req.json();

    if (!cardId || !currentPhone || !newPhone) {
      return NextResponse.json({ message: 'Thiếu thông tin' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const snap = await adminDb.doc(`cardAuth/${cardId}`).get();

    if (!snap.exists) {
      return NextResponse.json({ message: 'Thẻ không tồn tại' }, { status: 404 });
    }

    const data = snap.data()!;

    if (data.lockedUntil && data.lockedUntil.toDate() > new Date()) {
      return NextResponse.json(
        { message: 'Tài khoản đang bị khóa. Thử lại sau 15 phút.' },
        { status: 429 },
      );
    }

    if ((await hashPhone(currentPhone)) !== data.phoneHash) {
      const attempts = (data.failedAttempts ?? 0) + 1;
      const update: Record<string, unknown> = { failedAttempts: attempts };
      if (attempts >= 5) update.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await adminDb.doc(`cardAuth/${cardId}`).update(update);
      return NextResponse.json({ message: 'Mật khẩu hiện tại không đúng' }, { status: 401 });
    }

    await adminDb.doc(`cardAuth/${cardId}`).update({
      phoneHash: await hashPhone(newPhone),
      failedAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/change-password]', err);
    return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
  }
}
