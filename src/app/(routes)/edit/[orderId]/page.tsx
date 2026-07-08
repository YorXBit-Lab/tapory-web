import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { EditClient } from './EditClient';
import { getAdminDb } from '@/libs/firebase-admin';
import { noIndexRobots } from '@/libs/seo';
import type { TemplateId } from '@/configs/types';

export const metadata = {
  title: 'Chỉnh sửa kỷ niệm – Góc Chạm',
  robots: noIndexRobots,
};

const VALID_TEMPLATES: TemplateId[] = [
  'graduation',
  'wedding',
  'birthday',
  'anniversary',
  'spotify',
  'social',
  'profile',
  'keepsake',
  'album',
  'redirect',
  'stardust',
];

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { orderId } = await params;
  const { template } = await searchParams;

  // For real cards: always use the templateId stored in Firestore, ignore URL param.
  // For demo/unknown cards (no Firestore record): fall back to URL param.
  let initialTemplate: TemplateId = VALID_TEMPLATES.includes(template as TemplateId)
    ? (template as TemplateId)
    : 'graduation';

  if (orderId !== 'demo') {
    let cardExists: boolean | null = null;
    let storedTemplate: string | undefined;
    try {
      const snap = await getAdminDb().doc(`cards/${orderId}`).get();
      cardExists = snap.exists;
      storedTemplate = snap.data()?.templateId as string | undefined;
    } catch (err) {
      console.error('[EditPage] Admin SDK error:', err);
      // Admin SDK failed — allow through, CardAuthGate handles client-side auth
    }
    if (cardExists === false) notFound();
    if (storedTemplate && VALID_TEMPLATES.includes(storedTemplate as TemplateId)) {
      initialTemplate = storedTemplate as TemplateId;
    }
  }

  return (
    <>
      <Header />
      <EditClient orderId={orderId} initialTemplate={initialTemplate} />
    </>
  );
}
