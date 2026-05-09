import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';

function generateOrderId(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD${y}${m}${d}${rand}`;
}

async function hashPhone(phone: string): Promise<string> {
  let normalised = phone.replace(/\D/g, '');
  if (normalised.startsWith('84')) normalised = '0' + normalised.slice(2);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalised));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
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

    const body = (await req.json()) as {
      customerName?: string;
      phone?: string;
      templateId?: string;
      address?: string;
      price?: number;
      quantity?: number;
      notes?: string;
    };

    const { customerName, phone, templateId, address, price, notes } = body;
    const quantity = Math.min(Math.max(Number(body.quantity ?? 1), 1), 20);

    if (!customerName?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Thiếu tên khách hàng hoặc số điện thoại' }, { status: 400 });
    }

    const orderId = generateOrderId();
    const phoneHash = await hashPhone(phone.trim());
    const now = new Date();

    // Chip IDs: ORD260509XXXXC1, C2, ...
    const chipIds = Array.from({ length: quantity }, (_, i) => `${orderId}C${i + 1}`);

    const batch = adminDb.batch();

    batch.set(adminDb.collection('orders').doc(orderId), {
      customerName: customerName.trim(),
      phone: phone.trim(),
      templateId: templateId ?? 'birthday',
      address: (address ?? '').trim(),
      price: price ?? 189000,
      quantity,
      status: 'new',
      notes: (notes ?? '').trim(),
      customized: false,
      createdAt: now,
      updatedAt: now,
    });

    for (const chipId of chipIds) {
      batch.set(adminDb.collection('cards').doc(chipId), {
        orderId,
        status: 'assigned',
        hasContent: false,
        templateId: templateId ?? 'birthday',
        stats: { totalViews: 0 },
        createdAt: now,
        updatedAt: now,
      });

      batch.set(adminDb.collection('cardAuth').doc(chipId), {
        phoneHash,
        failCount: 0,
        lockedUntil: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();

    return NextResponse.json({ orderId, chipIds });
  } catch (err) {
    console.error('[create-order]', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
