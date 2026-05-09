'use client';

import type { TemplateId } from '@/configs/types';
import { CardAuthGate } from '@/features/auth/CardAuthGate';
import { EditorContainer } from '@/features/editor/EditorContainer';

export function EditClient({ orderId, initialTemplate }: { orderId: string; initialTemplate: TemplateId }) {
  return (
    <CardAuthGate cardId={orderId}>
      <EditorContainer orderId={orderId} initialTemplate={initialTemplate} />
    </CardAuthGate>
  );
}
