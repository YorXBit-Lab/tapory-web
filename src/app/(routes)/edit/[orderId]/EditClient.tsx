'use client';
import type { TemplateId } from '@/configs/types';
import { EditorContainer } from '@/features/editor/EditorContainer';

export function EditClient({ orderId, initialTemplate }: { orderId: string; initialTemplate: TemplateId }) {
  return <EditorContainer orderId={orderId} initialTemplate={initialTemplate} />;
}
