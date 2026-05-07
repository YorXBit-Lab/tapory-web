import type { Metadata } from 'next';
import { ViewClient } from './ViewClient';

export const metadata: Metadata = {
  title: 'Tapory',
};

export default async function ViewPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <ViewClient orderId={orderId} />;
}
