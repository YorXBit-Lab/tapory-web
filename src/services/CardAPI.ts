import {
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
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

  listAll: async (): Promise<ICard[]> => {
    const snaps = await getDocs(collection(db, CARDS));
    const cards = snaps.docs.map(s => {
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
    return cards.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  },

  listByOrder: async (orderId: string): Promise<ICard[]> => {
    const q = query(
      collection(db, CARDS),
      where('orderId', '==', orderId),
    );
    const snaps = await getDocs(q);
    const cards = snaps.docs.map(s => {
      const d = s.data();
      return {
        ...d,
        id: s.id,
        stats: d.stats ?? { totalViews: 0 },
        createdAt:    d.createdAt?.toDate?.()?.toISOString(),
        updatedAt:    d.updatedAt?.toDate?.()?.toISOString(),
        publishedAt:  d.publishedAt?.toDate?.()?.toISOString(),
        nfcWrittenAt: d.nfcWrittenAt?.toDate?.()?.toISOString(),
      } as ICard;
    });
    // Sort by id (chip suffix C1, C2...) client-side to avoid composite index requirement
    return cards.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  },

  deleteByOrder: async (orderId: string): Promise<void> => {
    const CARD_AUTH = FIRESTORE_COLLECTIONS.CARD_AUTH;
    const CARD_VIEWS = FIRESTORE_COLLECTIONS.CARD_VIEWS;

    const cardSnaps = await getDocs(
      query(collection(db, CARDS), where('orderId', '==', orderId)),
    );

    await Promise.all(
      cardSnaps.docs.map(async (cardDoc) => {
        const cardId = cardDoc.id;

        // cardAuth — doc id = cardId
        await deleteDoc(doc(db, CARD_AUTH, cardId)).catch(() => null);

        // cardViews — query by cardId
        const viewSnaps = await getDocs(
          query(collection(db, CARD_VIEWS), where('cardId', '==', cardId)),
        );
        await Promise.all(viewSnaps.docs.map(s => deleteDoc(s.ref)));

        // card itself
        await deleteDoc(cardDoc.ref);
      }),
    );
  },

  markNfcWritten: async (cardId: string) => {
    await updateDoc(doc(db, CARDS, cardId), {
      nfcWritten: true,
      nfcWrittenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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
