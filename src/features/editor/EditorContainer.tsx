'use client';
import '@/templates/init';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import type { TemplateId } from '@/configs/types';
import { TEMPLATES } from '@/configs/constants';
import type { RootState } from '@/redux/store';
import { EditorProvider } from './context';
import { useEditorInit } from './hooks/useEditorInit';
import { EditorForm } from './components/EditorForm';
import { PhonePreview } from '@/features/preview/PhonePreview';

interface Props {
  orderId: string;
  initialTemplate: TemplateId;
}

function EditorInner({ orderId, initialTemplate }: Props) {
  useEditorInit(orderId, initialTemplate);
  const templateId = useSelector((s: RootState) => s.edit.templateId);
  const tpl = TEMPLATES[templateId] ?? TEMPLATES[initialTemplate];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 lg:py-8">
      <div className="mb-4 flex items-center gap-2 text-sm lg:mb-6">
        <Link href="/templates" className="text-content3 transition-colors hover:text-primary">← Đổi loại</Link>
        <span className="text-content4">/</span>
        <span className="font-medium text-content1">{tpl?.icon} {tpl?.name}</span>
        <span className="text-xs text-content4">#{orderId}</span>
      </div>

      {/* Mobile: preview first (top), form below. Desktop: form left, preview sticky right */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="order-last min-w-0 flex-1 lg:order-none">
          <EditorForm />
        </div>
        <div className="order-first lg:order-none">
          <PhonePreview />
        </div>
      </div>
    </main>
  );
}

export function EditorContainer({ orderId, initialTemplate }: Props) {
  return (
    <EditorProvider>
      <EditorInner orderId={orderId} initialTemplate={initialTemplate} />
    </EditorProvider>
  );
}
