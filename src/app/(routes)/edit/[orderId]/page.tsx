import { Header } from '@/components/layout/Header';
import { EditClient } from './EditClient';
import type { TemplateId } from '@/configs/types';

export const metadata = {
  title: 'Chỉnh sửa kỷ niệm – Tapory',
};

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { orderId } = await params;
  const { template } = await searchParams;

  const validTemplates: TemplateId[] = ['graduation', 'wedding', 'birthday', 'anniversary', 'spotify', 'social'];
  const initialTemplate: TemplateId = validTemplates.includes(template as TemplateId)
    ? (template as TemplateId)
    : 'graduation';

  return (
    <>
      <Header />
      <EditClient orderId={orderId} initialTemplate={initialTemplate} />
    </>
  );
}
