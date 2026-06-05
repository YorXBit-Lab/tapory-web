import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';

export async function POST(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminDb = getAdminDb();

    const adminSnap = await adminDb.collection('admins').doc(decoded.uid).get();
    if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { orderId } = (await req.json()) as { orderId: string };
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const orderRef = adminDb.collection('purchase_orders').doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return NextResponse.json({ error: 'Phiếu không tồn tại' }, { status: 404 });

    const orderData = orderSnap.data() as {
      status: string;
      items: Array<{ productId: string; variantId?: string; quantity: number }>;
    };

    if (orderData.status === 'received') {
      return NextResponse.json({ error: 'Phiếu đã được xác nhận trước đó' }, { status: 409 });
    }

    const now = new Date();
    const batch = adminDb.batch();

    for (const item of orderData.items) {
      if (!item.productId || !item.quantity) continue;
      const updateData: Record<string, unknown> = { updatedAt: now };
      if (item.variantId) {
        updateData[`variants.${item.variantId}.stock`] = FieldValue.increment(item.quantity);
      } else {
        updateData.stock = FieldValue.increment(item.quantity);
      }
      batch.update(adminDb.collection('products').doc(item.productId), updateData);
    }

    batch.update(orderRef, {
      status: 'received',
      receivedAt: now,
      updatedAt: now,
    });

    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[purchase-orders/confirm]', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
