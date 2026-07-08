'use client';
import { useEditorContext } from '@/features/editor/context';
import { updateField } from '@/redux/editSlice';

// Bộ font rút gọn (6) cho gọn UI — đa dạng tính cách, tránh các kiểu na ná nhau.
// Lưu ý: getFontFamily() vẫn map đầy đủ các id cũ (raleway/josefin/lora…) nên
// card đã lưu bằng font cũ vẫn hiển thị đúng, chỉ không chọn lại được ở đây.
const FONTS = [
  { id: 'sans',       label: 'Hiện đại',  sub: 'Montserrat',        fontFamily: 'var(--font-montserrat), Montserrat, sans-serif'             },
  { id: 'be-vietnam', label: 'Việt Nam',  sub: 'Be Vietnam Pro',    fontFamily: 'var(--font-be-vietnam), "Be Vietnam Pro", sans-serif'       },
  { id: 'nunito',     label: 'Tròn trịa', sub: 'Nunito',            fontFamily: 'var(--font-nunito), Nunito, sans-serif'                     },
  { id: 'serif',      label: 'Sang trọng',sub: 'Playfair Display',  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif'    },
  { id: 'cormorant',  label: 'Cổ điển',   sub: 'Cormorant Garamond',fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' },
  { id: 'script',     label: 'Lãng mạn',  sub: 'Dancing Script',    fontFamily: 'var(--font-dancing), "Dancing Script", cursive'             },
];

const SIZES = [
  { id: 'sm', label: 'S', aaSize: 13, aaWeight: 500 },
  { id: 'md', label: 'M', aaSize: 17, aaWeight: 600 },
  { id: 'lg', label: 'L', aaSize: 22, aaWeight: 700 },
];

export function FontPicker() {
  const { draft, dispatch } = useEditorContext();
  const currentFont = draft.fontStyle || 'sans';
  const currentSize = draft.titleSize  || 'md';

  const activeFont = FONTS.find(f => f.id === currentFont) ?? FONTS[0];

  return (
    <div className="space-y-3">

      {/* ── Font grid — 3 columns ── */}
      <div>
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-content3">Kiểu chữ</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {FONTS.map(f => {
            const isActive = currentFont === f.id;
            return (
              <button
                key={f.id}
                onClick={() => dispatch(updateField({ fontStyle: f.id }))}
                className={`flex flex-col items-center justify-center rounded-xl border py-2.5 px-1 transition-all ${
                  isActive
                    ? 'border-primary bg-primary/[0.05] ring-1 ring-primary/20 shadow-sm'
                    : 'border-border hover:border-primary/40 bg-white'
                }`}
              >
                {/* "Aa" preview in actual font */}
                <span
                  className="select-none leading-none"
                  style={{
                    fontFamily: f.fontFamily,
                    fontSize: 18,
                    fontWeight: 600,
                    color: isActive ? 'var(--color-primary, #6366f1)' : '#374151',
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  Aa
                </span>
                {/* Label */}
                <span
                  className={`text-[10px] leading-tight text-center font-medium ${
                    isActive ? 'text-primary' : 'text-content3'
                  }`}
                  style={{ fontFamily: f.fontFamily }}
                >
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Size row — "Aa" in active font at actual size ── */}
      <div className="flex items-center gap-2">
        <span className="w-16 flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-content3">Cỡ chữ</span>
        <div className="flex gap-1.5">
          {SIZES.map(s => (
            <button
              key={s.id}
              onClick={() => dispatch(updateField({ titleSize: s.id }))}
              className={`relative flex h-[46px] w-[52px] flex-col items-center justify-center rounded-lg border transition-all overflow-hidden ${
                currentSize === s.id
                  ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <span
                className={`leading-none select-none ${currentSize === s.id ? 'text-primary' : 'text-content2'}`}
                style={{
                  fontFamily: activeFont.fontFamily,
                  fontSize: s.aaSize,
                  fontWeight: s.aaWeight,
                  lineHeight: 1,
                }}
              >
                Aa
              </span>
              <span className={`mt-1 text-[9px] font-semibold leading-none ${currentSize === s.id ? 'text-primary/70' : 'text-content3'}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
