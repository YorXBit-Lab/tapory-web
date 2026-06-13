import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import { getAdminDb } from '@/libs/firebase-admin';
import { noIndexRobots } from '@/libs/seo';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Đang mở Góc Chạm',
  robots: noIndexRobots,
};

export default async function NfcRedirectPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;

  try {
    const snap = await getAdminDb().collection(FIRESTORE_COLLECTIONS.CARDS).doc(cardId).get();
    const card = snap.exists ? snap.data() : null;

    if (!card || !card.hasContent) {
      redirect(`/edit/${cardId}`);
    }
  } catch {
    redirect(`/edit/${cardId}`);
  }

  redirect(`/view/${cardId}`);
}
