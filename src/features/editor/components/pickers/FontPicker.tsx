'use client';
import { useEditorContext } from '@/features/editor/context';
import { updateField } from '@/redux/editSlice';

const FONTS = [
  { id: 'sans',   label: 'Hiện đại',  fontFamily: 'var(--font-montserrat), Montserrat, sans-serif' },
  { id: 'serif',  label: 'Sang trọng', fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif' },
  { id: 'script', label: 'Lãng mạn',  fontFamily: 'var(--font-dancing), "Dancing Script", cursive' },
];

const SIZES = [
  { id: 'sm', label: 'S' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'L' },
];

export function FontPicker() {
  const { draft, dispatch } = useEditorContext();
  const currentFont = draft.fontStyle || 'sans';
  const currentSize = draft.titleSize || 'md';

  return (
    <div className="space-y-3">
      {/* Font row */}
      <div className="flex items-center gap-2">
        <span className="w-16 flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-content3">Kiểu</span>
        <div className="flex flex-1 gap-1.5">
          {FONTS.map(f => (
            <button
              key={f.id}
              onClick={() => dispatch(updateField({ fontStyle: f.id }))}
              className={`flex flex-1 items-center justify-center rounded-lg border py-1.5 transition-all ${
                currentFont === f.id
                  ? 'border-primary bg-primary/8 text-primary'
                  : 'border-border text-content2 hover:border-primary/40'
              }`}
            >
              <span className="text-[11px] font-medium" style={{ fontFamily: f.fontFamily }}>
                {f.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Size row */}
      <div className="flex items-center gap-2">
        <span className="w-16 flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-content3">Cỡ chữ</span>
        <div className="flex gap-1.5">
          {SIZES.map(s => (
            <button
              key={s.id}
              onClick={() => dispatch(updateField({ titleSize: s.id }))}
              className={`h-8 w-10 rounded-lg border text-[11px] font-semibold transition-all ${
                currentSize === s.id
                  ? 'border-primary bg-primary/8 text-primary'
                  : 'border-border text-content2 hover:border-primary/40'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
