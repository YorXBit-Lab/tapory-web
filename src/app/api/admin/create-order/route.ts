import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import { createOrderRecord } from '@/utils/order-create';
import type { IOrderItem } from '@/services/OrderAPI';

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
      shippingFee?: number;
      shippingRateName?: string;
    };

    const { orderId, chipIds } = await createOrderRecord(adminDb, {
      customerName: body.customerName ?? '',
      phone: body.phone,
      address: body.address,
      notes: body.notes,
      items: body.items ?? [],
      shippingFee: body.shippingFee,
      shippingRateName: body.shippingRateName,
      source: 'local',
    });

    return NextResponse.json({ orderId, chipIds });
  } catch (err) {
    console.error('[create-order]', err);
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
