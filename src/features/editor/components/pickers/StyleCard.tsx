import type { ITemplateStyle } from '@/configs/types';

interface Colors { primary: string; secondary: string; accent: string }

function MiniPreview({ layout, c }: { layout: string; c: Colors }) {
  const bar = (w: string, h: number, color: string, op: number, mt = 0) => (
    <div style={{ width: w, height: h, borderRadius: 2, backgroundColor: color, opacity: op, marginTop: mt, flexShrink: 0 }} />
  );

  /* ── Romantic: photo top-band, content centred below ── */
  if (layout === 'romantic') return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg" style={{ background: c.accent }}>
      <div className="relative flex-shrink-0" style={{ height: '48%', background: `linear-gradient(135deg,${c.secondary}66,${c.primary}44)` }}>
        <div className="absolute inset-x-0 bottom-0" style={{ height: '40%', background: `linear-gradient(to bottom,transparent,${c.accent}cc)` }} />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2 pb-1">
        {bar('72%', 2.5, c.primary, 0.75)}
        {bar('44%', 1, c.secondary, 0.45, 1)}
        {bar('88%', 1, c.primary, 0.18, 3)}
        {bar('68%', 1, c.primary, 0.13)}
      </div>
    </div>
  );

  /* ── Elegant: centre-framed photo card, gold rules ── */
  if (layout === 'elegant') return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-[3px] overflow-hidden rounded-lg px-2 py-2" style={{ background: '#fafaf8' }}>
      {bar('55%', 0.8, c.secondary, 0.55)}
      <div style={{ border: `1px solid ${c.secondary}`, padding: 2, marginTop: 3 }}>
        <div style={{ width: 24, height: 18, background: `linear-gradient(135deg,${c.secondary}44,${c.primary}22)` }} />
      </div>
      {bar('68%', 2, c.primary, 0.72, 3)}
      {bar('45%', 0.8, c.secondary, 0.40, 2)}
      {bar('80%', 0.8, c.primary, 0.18, 3)}
    </div>
  );

  /* ── Story: dark bg, full photo + text overlay, desc below ── */
  if (layout === 'story') return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg" style={{ background: '#0d0d0d' }}>
      <div className="relative flex-shrink-0" style={{ height: '60%', background: `linear-gradient(160deg,${c.secondary}55,${c.primary}33)` }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.55) 100%)' }} />
        <div className="absolute inset-x-0 bottom-1.5 flex flex-col items-center gap-[2px]">
          {bar('72%', 2.5, 'rgba(255,255,255,0.88)', 1)}
          {bar('44%', 0.8, c.secondary, 0.80, 1.5)}
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2">
        {bar('78%', 0.8, 'rgba(255,255,255,0.30)', 1)}
        {bar('60%', 0.8, 'rgba(255,255,255,0.20)', 1)}
      </div>
    </div>
  );

  /* ── Classic (anniversary): portrait frame, text ── */
  if (layout === 'classic') return (
    <div className="flex h-full w-full flex-col items-center overflow-hidden rounded-lg py-2 px-2" style={{ background: c.accent }}>
      <div style={{ border: `1.5px solid ${c.secondary}`, padding: 1.5 }}>
        <div style={{ width: 22, height: 26, background: `linear-gradient(135deg,${c.secondary}44,${c.primary}22)` }} />
      </div>
      {bar('72%', 2, c.primary, 0.75, 5)}
      {bar('44%', 0.8, c.secondary, 0.50, 2)}
      {bar('80%', 0.8, c.primary, 0.18, 3)}
      {bar('60%', 0.8, c.primary, 0.13)}
    </div>
  );

  /* ── Editorial (anniversary): half-image left, text right ── */
  if (layout === 'editorial') return (
    <div className="flex h-full w-full overflow-hidden rounded-lg" style={{ background: c.accent }}>
      <div className="flex-shrink-0" style={{ width: '44%', background: `linear-gradient(180deg,${c.secondary}66,${c.primary}44)` }} />
      <div className="flex flex-1 flex-col justify-center gap-[3px] px-1.5 py-2">
        {bar('85%', 0.8, c.secondary, 0.55)}
        {bar('90%', 2, c.primary, 0.80, 1)}
        {bar('75%', 2, c.primary, 0.65)}
        {bar('88%', 0.8, c.primary, 0.20, 3)}
        {bar('65%', 0.8, c.primary, 0.15)}
      </div>
    </div>
  );

  /* ── Film (anniversary): dark film-strip style ── */
  if (layout === 'film') return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg" style={{ background: '#1a1a1a' }}>
      <div className="relative flex-shrink-0" style={{ height: '56%', background: `linear-gradient(135deg,${c.secondary}55,${c.primary}33)` }}>
        {[0, 1].map(side => (
          <div key={side} className="absolute top-0 bottom-0 flex flex-col justify-around py-0.5"
            style={{ [side === 0 ? 'left' : 'right']: 2 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 2.5, height: 3.5, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 0.5 }} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2">
        {bar('72%', 2, 'rgba(255,255,255,0.85)', 1)}
        {bar('44%', 0.8, c.secondary, 0.75, 2)}
      </div>
    </div>
  );

  /* ── Generic fallback ── */
  return (
    <div className="h-full w-full rounded-lg" style={{ background: `linear-gradient(135deg,${c.accent},${c.secondary}33)` }}>
      <div className="flex h-full flex-col items-center justify-center gap-1 px-2">
        {bar('70%', 2, c.primary, 0.70)}
        {bar('50%', 0.8, c.secondary, 0.50, 2)}
        {bar('80%', 0.8, c.primary, 0.20, 3)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */

interface Props {
  s: ITemplateStyle;
  active: boolean;
  onClick: () => void;
}

export function StyleCard({ s, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex w-[78px] flex-shrink-0 flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
        active ? 'border-primary scale-105 shadow-md' : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="h-[56px] w-full overflow-hidden rounded-lg">
        <MiniPreview layout={s.layout} c={s.colors} />
      </div>
      <span className="text-center text-[9px] font-medium leading-tight text-content2">{s.name}</span>
      {active && <div className="h-1 w-1 rounded-full bg-primary" />}
    </button>
  );
}
