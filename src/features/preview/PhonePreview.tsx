'use client';
import { useState, useEffect } from 'react';
import { useEditorContext } from '@/features/editor/context';
import { getScreenBackground } from './screenBg';
import { PhoneShell } from './PhoneShell';
import { TemplateRenderer } from './TemplateRenderer';
import { FrameOverlay } from './FrameOverlay';

export function PhonePreview() {
  const { draft, activeStyle, activeFrame } = useEditorContext();
  const [open, setOpen] = useState(false);
  const screenBg = getScreenBackground(draft, activeStyle);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const content = (
    <>
      <div className="absolute inset-0 overflow-y-auto" style={screenBg}>
        {activeStyle && <TemplateRenderer data={draft} style={activeStyle} />}
      </div>
      <FrameOverlay frame={activeFrame} />
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ boxShadow: 'inset 0 0 24px rgba(0,0,0,0.08), inset 0 0 0 0.5px rgba(255,255,255,0.04)' }} />
    </>
  );

  return (
    <aside className="flex flex-col items-center gap-5 lg:sticky lg:top-6 lg:w-[300px]">
      <div className="flex items-center gap-2">
        <div className="h-px w-8 rounded bg-content1 opacity-20" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-content3">Preview</p>
        <div className="h-px w-8 rounded bg-content1 opacity-20" />
      </div>

      {/* Clickable preview — zoom in on click */}
      <div className="cursor-zoom-in transition-opacity hover:opacity-90" onClick={() => setOpen(true)}>
        <PhoneShell>{content}</PhoneShell>
      </div>

      <p className="max-w-[220px] text-center text-[10px] leading-relaxed text-content4">
        Nhấn vào điện thoại để xem to hơn
      </p>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
          onClick={() => setOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute right-5 top-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-sm text-white transition-opacity hover:opacity-70"
            style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
            onClick={() => setOpen(false)}
          >
            ✕
          </button>

          {/* Enlarged phone — stop propagation so clicking phone doesn't close modal */}
          <div
            className="flex-shrink-0"
            style={{ width: 280, transform: 'scale(1.44)', transformOrigin: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <PhoneShell>{content}</PhoneShell>
          </div>
        </div>
      )}
    </aside>
  );
}
