'use client';
import { useEditorContext } from '@/features/editor/context';
import { updateField } from '@/redux/editSlice';

const SIZES = [
  { id: 'sm', name: 'Nhỏ',  previewSize: 15 },
  { id: 'md', name: 'Vừa',  previewSize: 20 },
  { id: 'lg', name: 'Lớn',  previewSize: 26 },
];

export function TitleSizePicker() {
  const { draft, dispatch } = useEditorContext();
  const current = draft.titleSize || 'md';

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content3">Cỡ tiêu đề</p>
      <div className="flex gap-2">
        {SIZES.map(s => (
          <button
            key={s.id}
            onClick={() => dispatch(updateField({ titleSize: s.id }))}
            className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 py-2.5 px-1 transition-all ${
              current === s.id
                ? 'border-primary scale-105 shadow-md'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="leading-none text-content1" style={{ fontSize: s.previewSize }}>Aa</span>
            <span className="text-[9px] font-medium text-content2">{s.name}</span>
            {current === s.id && <div className="h-1 w-1 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}
