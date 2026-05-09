import { NextRequest, NextResponse } from 'next/server';
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

    const { orderId, count = 1 } = (await req.json()) as { orderId?: string; count?: number };
    if (!orderId) return NextResponse.json({ error: 'Thiếu orderId' }, { status: 400 });

    // Get existing chips to determine next index
    const existingSnaps = await adminDb.collection('cards').where('orderId', '==', orderId).get();
    const nextIndex = existingSnaps.size + 1;

    // Read phoneHash from any existing cardAuth for this order
    let phoneHash = '';
    if (!existingSnaps.empty) {
      const firstCardId = existingSnaps.docs[0].id;
      const authSnap = await adminDb.doc(`cardAuth/${firstCardId}`).get();
      if (authSnap.exists) phoneHash = (authSnap.data() as { phoneHash: string }).phoneHash;
    }

    const qty = Math.min(Math.max(Number(count), 1), 10);
    const newChipIds: string[] = [];
    const now = new Date();
    const batch = adminDb.batch();

    for (let i = 0; i < qty; i++) {
      const chipId = `${orderId}C${nextIndex + i}`;
      newChipIds.push(chipId);

      batch.set(adminDb.collection('cards').doc(chipId), {
        orderId,
        status: 'assigned',
        hasContent: false,
        stats: { totalViews: 0 },
        createdAt: now,
        updatedAt: now,
      });

      if (phoneHash) {
        batch.set(adminDb.collection('cardAuth').doc(chipId), {
          phoneHash,
          failCount: 0,
          lockedUntil: null,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Update order quantity
    batch.update(adminDb.collection('orders').doc(orderId), {
      quantity: nextIndex - 1 + qty,
      updatedAt: now,
    });

    await batch.commit();
    return NextResponse.json({ newChipIds });
  } catch (err) {
    console.error('[add-chip]', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
