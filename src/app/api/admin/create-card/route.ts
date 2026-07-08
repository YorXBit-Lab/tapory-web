import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import { normalisePhone, hashPhone } from '@/utils/phone';
import type { TemplateId } from '@/configs/types';

const VALID_TEMPLATES: TemplateId[] = [
  'graduation',
  'wedding',
  'birthday',
  'anniversary',
  'spotify',
  'social',
  'profile',
  'keepsake',
  'album',
  'redirect',
];

function generateCardId(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TPL${y}${m}${d}${rand}`;
}

export async function POST(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminDb = getAdminDb();

    const adminSnap = await adminDb.collection('admins').doc(decoded.uid).get();
    if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { templateId, password } = (await req.json()) as { templateId?: string; password?: string };
    const template: TemplateId = VALID_TEMPLATES.includes(templateId as TemplateId)
      ? (templateId as TemplateId)
      : 'graduation';

    const rawPassword = (password ?? '').trim();
    const normalised = normalisePhone(rawPassword);
    if (rawPassword && !normalised) {
      return NextResponse.json({ error: 'Mật khẩu phải chứa chữ số' }, { status: 400 });
    }

    // Sinh id độc nhất (không đụng chip theo đơn dạng ORD...C...)
    let cardId = generateCardId();
    for (let i = 0; i < 5; i++) {
      const exists = (await adminDb.collection('cards').doc(cardId).get()).exists;
      if (!exists) break;
      cardId = generateCardId();
    }

    const now = new Date();
    const hasPassword = !!normalised;

    await adminDb.collection('cards').doc(cardId).set({
      orderId: '',
      standalone: true,
      status: 'blank',
      hasContent: false,
      templateId: template,
      hasPassword,
      stats: { totalViews: 0 },
      createdAt: now,
      updatedAt: now,
    });

    if (hasPassword) {
      await adminDb.collection('cardAuth').doc(cardId).set({
        phoneHash: await hashPhone(rawPassword),
        failCount: 0,
        lockedUntil: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json({ cardId, templateId: template, hasPassword });
  } catch (err) {
    console.error('[create-card]', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
