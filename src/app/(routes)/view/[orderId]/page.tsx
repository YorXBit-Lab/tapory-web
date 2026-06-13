import type { Metadata } from 'next';
import { getAdminDb } from '@/libs/firebase-admin';
import { FIRESTORE_COLLECTIONS, TEMPLATES } from '@/configs/constants';
import { noIndexRobots } from '@/libs/seo';
import { ViewClient } from './ViewClient';

/* ── Dynamic OpenGraph metadata ─────────────────────────────────────────────── */
export async function generateMetadata(
  { params }: { params: Promise<{ orderId: string }> },
): Promise<Metadata> {
  const { orderId } = await params;

  try {
    const db   = getAdminDb();
    const snap = await db.collection(FIRESTORE_COLLECTIONS.MEMORIALS).doc(orderId).get();
    const data = snap.exists ? snap.data() : null;

    if (!data) {
      return {
        title: 'Góc Chạm',
        description: 'Trang kỷ niệm NFC cá nhân',
        robots: noIndexRobots,
      };
    }

    const title      = (data.title    as string) || 'Kỷ Niệm Của Tôi';
    const subtitle   = (data.subtitle as string) || '';
    const templateId = (data.templateId as string) || 'birthday';
    const tpl        = TEMPLATES[templateId as keyof typeof TEMPLATES];

    const description = subtitle
      || (tpl ? `${tpl.icon} ${tpl.name} — Xem trang kỷ niệm trên Tapory` : 'Xem trang kỷ niệm trên Tapory');

    const ogImageUrl = `/api/og/${orderId}`;

    return {
      title: `${title} — Góc Chạm`,
      description,
      openGraph: {
        title,
        description,
        type:   'website',
        locale: 'vi_VN',
        images: [
          {
            url:    ogImageUrl,
            width:  1200,
            height: 630,
            alt:    title,
          },
        ],
      },
      twitter: {
        card:        'summary_large_image',
        title,
        description,
        images:      [ogImageUrl],
      },
      robots: noIndexRobots,
    };
  } catch {
    return {
      title: 'Góc Chạm',
      description: 'Trang kỷ niệm NFC cá nhân',
      robots: noIndexRobots,
    };
  }
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default async function ViewPage(
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  return <ViewClient orderId={orderId} />;
}
