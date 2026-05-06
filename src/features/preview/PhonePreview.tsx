'use client';
import { useEditorContext } from '@/features/editor/context';
import { getScreenBackground } from './screenBg';
import { PhoneShell } from './PhoneShell';
import { TemplateRenderer } from './TemplateRenderer';
import { FrameOverlay } from './FrameOverlay';

export function PhonePreview() {
  const { draft, activeStyle, activeFrame } = useEditorContext();
  const screenBg = getScreenBackground(draft, activeStyle);

  return (
    <aside className="flex flex-col items-center gap-5 lg:sticky lg:top-6 lg:w-[300px]">
      <div className="flex items-center gap-2">
        <div className="h-px w-8 rounded bg-content1 opacity-20" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-content3">Preview</p>
        <div className="h-px w-8 rounded bg-content1 opacity-20" />
      </div>
      <PhoneShell>
        <div className="absolute inset-0 overflow-y-auto" style={screenBg}>
          {activeStyle && <TemplateRenderer data={draft} style={activeStyle} />}
        </div>
        <FrameOverlay frame={activeFrame} />
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ boxShadow: 'inset 0 0 24px rgba(0,0,0,0.08), inset 0 0 0 0.5px rgba(255,255,255,0.04)' }}
        />
      </PhoneShell>
      <p className="max-w-[220px] text-center text-[10px] leading-relaxed text-content4">
        Giao diện người nhận thấy khi chạm điện thoại vào móc khóa
      </p>
    </aside>
  );
}
