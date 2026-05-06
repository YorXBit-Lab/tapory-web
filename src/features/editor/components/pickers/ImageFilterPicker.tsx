'use client';
import { useEditorContext } from '@/features/editor/context';
import { updateField } from '@/redux/editSlice';

const FILTERS = [
  { id: 'none',     name: 'Thường',    bg: 'linear-gradient(135deg,#e8e8e8,#f5f5f5)' },
  { id: 'warm',     name: 'Ấm áp',    bg: 'linear-gradient(135deg,#f5dfc0,#eebc78)' },
  { id: 'cool',     name: 'Mát lạnh',  bg: 'linear-gradient(135deg,#c0d5f5,#88b0e8)' },
  { id: 'sepia',    name: 'Cổ điển',  bg: 'linear-gradient(135deg,#d4b896,#b07840)' },
  { id: 'bw',       name: 'Trắng đen', bg: 'linear-gradient(135deg,#888,#ccc)' },
  { id: 'dramatic', name: 'Phim',      bg: 'linear-gradient(135deg,#1c1c1c,#555)' },
];

export function ImageFilterPicker() {
  const { draft, dispatch } = useEditorContext();
  const current = draft.imageFilter || 'none';

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content3">Bộ lọc ảnh</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => dispatch(updateField({ imageFilter: f.id }))}
            className={`flex w-[58px] flex-shrink-0 flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
              current === f.id
                ? 'border-primary scale-105 shadow-md'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="h-8 w-full rounded-md" style={{ background: f.bg }} />
            <span className="text-center text-[8.5px] font-medium leading-tight text-content2">{f.name}</span>
            {current === f.id && <div className="h-1 w-1 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}
