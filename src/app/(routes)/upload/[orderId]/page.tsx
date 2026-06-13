import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminDb } from '@/libs/firebase-admin';
import { noIndexRobots } from '@/libs/seo';
import UploadForm from './UploadForm';
import type { IPrintConfig, IPrintPhotoSlot } from '@/configs/types';
import type { IOrderItem } from '@/services/OrderAPI';

export const metadata: Metadata = {
  title: 'Upload ảnh in móc khóa - Góc Chạm',
  robots: noIndexRobots,
};

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function PrintUploadPage({ params }: PageProps) {
  const { orderId } = await params;

  const db = getAdminDb();
  const snap = await db.collection('orders').doc(orderId).get();
  if (!snap.exists) notFound();

  const data = snap.data() as Record<string, unknown>;
  const items = (data.items ?? []) as IOrderItem[];
  const printPhotos = (Array.isArray(data.printPhotos) ? data.printPhotos : []) as IPrintPhotoSlot[];

  const printItems = items
    .map((item, idx) => ({ ...item, itemIndex: idx }))
    .filter(item => item.printConfig?.enabled);

  if (!printItems.length) notFound();

  return (
    <UploadForm
      orderId={orderId}
      customerName={(data.customerName as string) ?? ''}
      printItems={printItems.map(item => ({
        itemIndex: item.itemIndex,
        productName: item.productName,
        quantity: item.quantity,
        printConfig: item.printConfig as IPrintConfig,
      }))}
      initialPhotos={printPhotos}
    />
  );
}
