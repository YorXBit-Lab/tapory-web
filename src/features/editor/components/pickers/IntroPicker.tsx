'use client';
import { useState } from 'react';
import { useEditorContext } from '@/features/editor/context';
import { setIntro } from '@/redux/editSlice';
import { INTROS } from '@/configs/constants';
import { IntroCard } from './IntroCard';
import { IntroOverlay } from '@/features/preview/IntroOverlay';
import { getTemplateStyles } from '@/templates/registry';

export function IntroPicker() {
  const { draft, dispatch } = useEditorContext();
  const [previewing, setPreviewing] = useState<string | null>(null);

  const styles = getTemplateStyles(draft.templateId);
  const activeStyle = styles.find(s => s.id === draft.styleId) ?? styles[0];
  const primaryColor = activeStyle?.colors.primary ?? '#c45c8a';
  const accentColor  = activeStyle?.colors.accent  ?? '#f8b4cc';

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-content3">Intro khi mở thẻ</p>
        {draft.introId && draft.introId !== 'none' && (
          <button
            onClick={() => setPreviewing(draft.introId!)}
            className="rounded-lg bg-elevated px-2 py-1 text-[10px] font-medium text-content2 hover:text-primary transition-colors"
          >
            ▶ Xem thử
          </button>
        )}
      </div>

      {/* px/py give the active card's scale + ring + shadow room (overflow-x-auto
          forces overflow-y:auto, which would otherwise clip them). */}
      <div className="flex gap-2 overflow-x-auto px-1 py-2">
        {INTROS.map(intro => (
          <IntroCard
            key={intro.id}
            intro={intro}
            active={
              (draft.introId === intro.id) ||
              (!draft.introId && intro.id === 'none')
            }
            onClick={() => {
              dispatch(setIntro(intro.id));
              // Chọn intro là xem thử luôn (trừ 'none'), khỏi cần bấm nút.
              setPreviewing(intro.id === 'none' ? null : intro.id);
            }}
          />
        ))}
      </div>

      {/* Hint text */}
      {draft.introId && draft.introId !== 'none' && (
        <p className="mt-2 text-[10px] leading-relaxed text-content4">
          {INTROS.find(i => i.id === draft.introId)?.hint} — người xem phải tương tác để vào nội dung.
        </p>
      )}

      {/* Preview overlay */}
      {previewing && (
        <IntroOverlay
          introId={previewing}
          onComplete={() => setPreviewing(null)}
          primaryColor={primaryColor}
          accentColor={accentColor}
          title={draft.title}
          imageUrl={draft.imageUrl}
        />
      )}
    </div>
  );
}
