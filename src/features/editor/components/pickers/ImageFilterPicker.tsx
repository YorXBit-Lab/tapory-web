'use client';
import { useEditorContext } from '@/features/editor/context';
import { updateField } from '@/redux/editSlice';

interface FilterDef {
  id: string;
  name: string;
  /* gradient used as photo-mock base */
  photoBg: string;
  /* colour overlay to simulate the filter */
  overlay: string;
  /* CSS filter string applied to the photo area */
  cssFilter?: string;
}

const FILTERS: FilterDef[] = [
  {
    id: 'none',
    name: 'Thường',
    photoBg: 'linear-gradient(135deg,#c8d8e8 0%,#a0b8c8 50%,#8aac9e 100%)',
    overlay: 'transparent',
  },
  {
    id: 'warm',
    name: 'Ấm áp',
    photoBg: 'linear-gradient(135deg,#d4b08c 0%,#c89060 50%,#b87840 100%)',
    overlay: 'rgba(255,160,60,0.18)',
    cssFilter: 'saturate(1.3) sepia(0.25)',
  },
  {
    id: 'cool',
    name: 'Mát lạnh',
    photoBg: 'linear-gradient(135deg,#90b4d8 0%,#7098c4 50%,#5880aa 100%)',
    overlay: 'rgba(80,140,220,0.15)',
    cssFilter: 'saturate(1.2) hue-rotate(15deg)',
  },
  {
    id: 'sepia',
    name: 'Cổ điển',
    photoBg: 'linear-gradient(135deg,#c8a880 0%,#b09060 50%,#98784a 100%)',
    overlay: 'rgba(160,110,50,0.22)',
    cssFilter: 'sepia(0.75) contrast(1.05)',
  },
  {
    id: 'bw',
    name: 'Trắng đen',
    photoBg: 'linear-gradient(135deg,#a0a0a0 0%,#787878 50%,#585858 100%)',
    overlay: 'rgba(0,0,0,0.08)',
    cssFilter: 'grayscale(1) contrast(1.1)',
  },
  {
    id: 'dramatic',
    name: 'Phim',
    photoBg: 'linear-gradient(135deg,#303038 0%,#202028 50%,#141418 100%)',
    overlay: 'rgba(0,0,0,0.30)',
    cssFilter: 'contrast(1.35) saturate(0.7) brightness(0.85)',
  },
];

export function ImageFilterPicker() {
  const { draft, dispatch } = useEditorContext();
  const current = draft.imageFilter || 'none';

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content3">Bộ lọc ảnh</p>
      {/* px/py: chừa chỗ cho scale + ring + shadow của card active khỏi bị overflow cắt */}
      <div className="flex gap-2 overflow-x-auto px-1 py-2">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => dispatch(updateField({ imageFilter: f.id }))}
            className={`flex w-[62px] flex-shrink-0 flex-col items-center gap-1.5 rounded-xl border-2 p-1.5 transition-all ${
              current === f.id
                ? 'border-primary bg-primary/[0.04] scale-[1.04] shadow-md shadow-primary/20 ring-2 ring-primary/15'
                : 'border-border hover:border-primary/40'
            }`}
          >
            {/* Photo-mock swatch — landscape, with simulated person silhouette */}
            <div
              className="relative w-full overflow-hidden rounded-md"
              style={{ height: 38, background: f.photoBg, filter: f.cssFilter }}
            >
              {/* Sky / background gradient */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 50%)' }} />
              {/* Ground strip */}
              <div className="absolute bottom-0 inset-x-0" style={{ height: '28%', background: 'rgba(0,0,0,0.18)', borderRadius: '0 0 5px 5px' }} />
              {/* Silhouette figure */}
              <div className="absolute" style={{ bottom: '25%', left: '50%', transform: 'translateX(-50%)' }}>
                {/* head */}
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', margin: '0 auto' }} />
                {/* body */}
                <div style={{ width: 9, height: 11, borderRadius: '3px 3px 0 0', background: 'rgba(0,0,0,0.40)', marginTop: 1 }} />
              </div>
              {/* filter colour overlay */}
              <div className="absolute inset-0" style={{ background: f.overlay, borderRadius: 5 }} />
            </div>
            <span className="text-center text-[8.5px] font-medium leading-tight text-content2">{f.name}</span>
            {current === f.id && <div className="h-1 w-1 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}
