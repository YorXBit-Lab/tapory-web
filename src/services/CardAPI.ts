import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import type { ICard } from '@/configs/types';

const CARDS = FIRESTORE_COLLECTIONS.CARDS;
const VIEWS = FIRESTORE_COLLECTIONS.CARD_VIEWS;

export const CardAPI = {
  getOne: async (cardId: string): Promise<ICard | null> => {
    const snap = await getDoc(doc(db, CARDS, cardId));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      ...d,
      id: snap.id,
      stats: d.stats ?? { totalViews: 0 },
      createdAt: d.createdAt?.toDate?.()?.toISOString(),
      updatedAt: d.updatedAt?.toDate?.()?.toISOString(),
      publishedAt: d.publishedAt?.toDate?.()?.toISOString(),
      editDeadline: d.editDeadline?.toDate?.()?.toISOString(),
    } as ICard;
  },

  listByOrder: async (orderId: string): Promise<ICard[]> => {
    const q = query(
      collection(db, CARDS),
      where('orderId', '==', orderId),
      orderBy('createdAt', 'asc'),
    );
    const snaps = await getDocs(q);
    return snaps.docs.map(s => {
      const d = s.data();
      return {
        ...d,
        id: s.id,
        stats: d.stats ?? { totalViews: 0 },
        createdAt: d.createdAt?.toDate?.()?.toISOString(),
        updatedAt: d.updatedAt?.toDate?.()?.toISOString(),
        publishedAt: d.publishedAt?.toDate?.()?.toISOString(),
      } as ICard;
    });
  },

  markPublished: async (cardId: string, templateId: string) => {
    await updateDoc(doc(db, CARDS, cardId), {
      status: 'published',
      hasContent: true,
      templateId,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  trackView: async (cardId: string, isOwnerView = false) => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/mobile/i.test(ua)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

    await addDoc(collection(db, VIEWS), {
      cardId,
      orderId: cardId,
      timestamp: serverTimestamp(),
      deviceType,
      userAgent: ua.slice(0, 200),
      isOwnerView,
    });

    // Best-effort increment on cards doc (may not exist yet)
    try {
      const ref = doc(db, CARDS, cardId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const cur = snap.data().stats?.totalViews ?? 0;
        await updateDoc(ref, {
          'stats.totalViews': cur + 1,
          'stats.lastViewedAt': serverTimestamp(),
        });
      }
    } catch {
      // cards doc might not exist — fine
    }
  },
};
