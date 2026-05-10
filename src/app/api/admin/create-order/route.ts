import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import type { IOrderItem } from '@/services/OrderAPI';

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
      address?: string;
      notes?: string;
      items?: IOrderItem[];
    };

    const { customerName, phone, address, notes, items = [] } = body;

    if (!customerName?.trim()) {
      return NextResponse.json({ error: 'Thiếu tên khách hàng' }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: 'Đơn hàng phải có ít nhất 1 sản phẩm' }, { status: 400 });
    }

    const hasNfc = items.some(i => i.isNfc);
    if (hasNfc && !phone?.trim()) {
      return NextResponse.json({ error: 'Cần số điện thoại cho đơn có móc khóa NFC' }, { status: 400 });
    }

    const totalPrice = items.reduce((s, item) => s + item.unitPrice * item.quantity, 0);
    const orderId = generateOrderId();
    const now = new Date();

    // Build chip list from NFC items
    let chipCounter = 0;
    const chipList: { id: string; templateId: string }[] = [];
    for (const item of items) {
      if (item.isNfc) {
        for (let i = 0; i < item.quantity; i++) {
          chipCounter++;
          chipList.push({ id: `${orderId}C${chipCounter}`, templateId: item.templateId ?? 'birthday' });
        }
      }
    }

    const phoneHash = hasNfc && phone ? await hashPhone(phone.trim()) : null;
    const batch = adminDb.batch();

    batch.set(adminDb.collection('orders').doc(orderId), {
      customerName: customerName.trim(),
      phone: (phone ?? '').trim(),
      address: (address ?? '').trim(),
      price: totalPrice,
      status: 'new',
      source: 'local',
      items,
      notes: (notes ?? '').trim(),
      customized: false,
      createdAt: now,
      updatedAt: now,
    });

    for (const chip of chipList) {
      batch.set(adminDb.collection('cards').doc(chip.id), {
        orderId,
        status: 'assigned',
        hasContent: false,
        templateId: chip.templateId,
        stats: { totalViews: 0 },
        createdAt: now,
        updatedAt: now,
      });

      if (phoneHash) {
        batch.set(adminDb.collection('cardAuth').doc(chip.id), {
          phoneHash,
          failCount: 0,
          lockedUntil: null,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await batch.commit();

    return NextResponse.json({ orderId, chipIds: chipList.map(c => c.id) });
  } catch (err) {
    console.error('[create-order]', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
