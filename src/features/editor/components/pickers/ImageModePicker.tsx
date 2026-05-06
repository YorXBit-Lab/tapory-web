'use client';
import { useEditorContext } from '@/features/editor/context';
import { updateField } from '@/redux/editSlice';

const MODES = [
  {
    id: 'full',
    name: 'Đầy đủ',
    icon: (
      <svg width="36" height="26" viewBox="0 0 36 26" fill="none">
        <rect x="1" y="1" width="34" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="4" y="4" width="28" height="11" rx="1" fill="currentColor" fillOpacity="0.25"/>
        <rect x="4" y="17" width="18" height="2" rx="1" fill="currentColor" fillOpacity="0.20"/>
        <rect x="4" y="21" width="12" height="2" rx="1" fill="currentColor" fillOpacity="0.15"/>
      </svg>
    ),
  },
  {
    id: 'card',
    name: 'Khung',
    icon: (
      <svg width="26" height="32" viewBox="0 0 26 32" fill="none">
        <rect x="1" y="1" width="24" height="30" rx="1.5" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="3.5" y="3.5" width="19" height="25" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.45"/>
        <rect x="5" y="5" width="16" height="14" rx="0.5" fill="currentColor" fillOpacity="0.22"/>
        <rect x="5" y="21" width="10" height="2" rx="1" fill="currentColor" fillOpacity="0.20"/>
        <rect x="5" y="25" width="7" height="2" rx="1" fill="currentColor" fillOpacity="0.15"/>
      </svg>
    ),
  },
  {
    id: 'circle',
    name: 'Tròn',
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="14" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="15" cy="15" r="9" fill="currentColor" fillOpacity="0.22"/>
      </svg>
    ),
  },
];

export function ImageModePicker() {
  const { draft, dispatch } = useEditorContext();
  const current = draft.imageMode || 'full';

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content3">Kiểu ảnh</p>
      <div className="flex gap-2">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => dispatch(updateField({ imageMode: m.id }))}
            className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 py-2.5 px-1 transition-all ${
              current === m.id
                ? 'border-primary scale-105 shadow-md text-primary'
                : 'border-border text-content3 hover:border-primary/40'
            }`}
          >
            {m.icon}
            <span className="text-[9px] font-medium text-content2">{m.name}</span>
            {current === m.id && <div className="h-1 w-1 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}
