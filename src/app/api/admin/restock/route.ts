import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';

interface RestockEntry {
  productId: string;
  variantId?: string;
  delta: number; // số lượng nhập thêm (phải > 0)
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

    const { updates } = (await req.json()) as { updates: RestockEntry[] };
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Không có sản phẩm nào để nhập' }, { status: 400 });
    }

    const valid = updates.filter(u => u.productId && Number.isInteger(u.delta) && u.delta > 0);
    if (valid.length === 0) {
      return NextResponse.json({ error: 'Số lượng nhập phải là số nguyên dương' }, { status: 400 });
    }

    const now = new Date();
    const batch = adminDb.batch();
    for (const { productId, variantId, delta } of valid) {
      const updateData: Record<string, unknown> = { updatedAt: now };
      if (variantId) {
        updateData[`variants.${variantId}.stock`] = FieldValue.increment(delta);
      } else {
        updateData.stock = FieldValue.increment(delta);
      }
      batch.update(adminDb.collection('products').doc(productId), updateData);
    }
    await batch.commit();

    return NextResponse.json({ ok: true, updated: valid.length });
  } catch (err) {
    console.error('[restock]', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
