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

  /* ── Editorial: half-image left, text right ── */
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

  /* ── Film: dark film-strip style ── */
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

  /* ── Love (anniversary): two heart bubbles ── */
  if (layout === 'love') return (
    <div className="flex h-full w-full flex-col items-center overflow-hidden rounded-lg" style={{ background: `linear-gradient(160deg,${c.accent},${c.secondary}22)` }}>
      <div className="flex items-end justify-center" style={{ height: '44%', paddingBottom: 4, gap: 4 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${c.primary}33`, border: `1.5px solid ${c.primary}55` }} />
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${c.secondary}44`, border: `1.5px solid ${c.secondary}77` }} />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2">
        {bar('66%', 2, c.primary, 0.72)}
        {bar('42%', 0.8, c.secondary, 0.50, 2)}
        {bar('76%', 0.8, c.primary, 0.18, 3)}
      </div>
    </div>
  );

  /* ── Party (birthday): festive, confetti dots ── */
  if (layout === 'party') return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-lg" style={{ background: `linear-gradient(135deg,${c.secondary}44,${c.primary}22)` }}>
      {/* confetti dots */}
      {[[14,18],[72,10],[28,55],[82,42],[48,8],[62,70],[8,72]].map(([x, y], i) => (
        <div key={i} style={{ position:'absolute', left:`${x}%`, top:`${y}%`, width: i%2===0?3:2, height: i%2===0?3:2, borderRadius:'50%', background: i%3===0?c.primary:i%3===1?c.secondary:'#fff', opacity:0.65 }} />
      ))}
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${c.primary}55,${c.secondary}44)`, marginTop: 10, border: `1.5px solid ${c.primary}44` }} />
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2">
        {bar('70%', 2.5, c.primary, 0.80)}
        {bar('46%', 1, c.secondary, 0.55, 1)}
        {bar('82%', 1, c.primary, 0.20, 3)}
      </div>
    </div>
  );

  /* ── Retro (birthday): vintage dot-grid bg ── */
  if (layout === 'retro') return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-lg" style={{ background: c.accent }}>
      {/* dot grid */}
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle,${c.primary}22 1px,transparent 1px)`, backgroundSize: '6px 6px' }} />
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2 relative">
        <div style={{ border: `2px solid ${c.primary}66`, padding: '3px 8px', borderRadius: 2, marginBottom: 4 }}>
          <div style={{ height: 2, width: 36, background: c.primary, opacity: 0.75 }} />
        </div>
        {bar('64%', 2, c.primary, 0.72)}
        {bar('82%', 1, c.secondary, 0.45, 2)}
      </div>
    </div>
  );

  /* ── Minimal: ultra-clean whitespace ── */
  if (layout === 'minimal') return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg" style={{ background: '#fff' }}>
      <div style={{ width: '100%', height: 0.5, background: c.primary, opacity: 0.20, marginBottom: 6 }} />
      {bar('52%', 2, c.primary, 0.65)}
      {bar('34%', 0.8, c.secondary, 0.35, 3)}
      {bar('70%', 0.8, c.primary, 0.12, 6)}
      <div style={{ width: '100%', height: 0.5, background: c.primary, opacity: 0.20, marginTop: 6 }} />
    </div>
  );

  /* ── Pastel: soft blobs, airy ── */
  if (layout === 'pastel') return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-lg" style={{ background: '#faf7f5' }}>
      <div className="absolute" style={{ width: 48, height: 32, borderRadius: '50%', background: `${c.primary}22`, top: -8, left: -8 }} />
      <div className="absolute" style={{ width: 32, height: 32, borderRadius: '50%', background: `${c.secondary}22`, bottom: 4, right: -6 }} />
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2 relative">
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg,${c.secondary}44,${c.primary}33)`, marginBottom: 4 }} />
        {bar('60%', 2, c.primary, 0.60)}
        {bar('40%', 0.8, c.secondary, 0.40, 2)}
        {bar('75%', 0.8, c.primary, 0.15, 3)}
      </div>
    </div>
  );

  /* ── Academic (graduation): formal diploma frame ── */
  if (layout === 'academic') return (
    <div className="flex h-full w-full flex-col items-center overflow-hidden rounded-lg" style={{ background: '#fdfbf5' }}>
      <div style={{ width: '100%', height: 3, background: `linear-gradient(90deg,${c.secondary},${c.primary},${c.secondary})`, opacity: 0.80 }} />
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2">
        <div style={{ border: `1px solid ${c.secondary}66`, padding: '2px 10px', marginBottom: 4 }}>
          <div style={{ width: 16, height: 12, background: `${c.primary}22`, border: `0.5px solid ${c.secondary}44` }} />
        </div>
        {bar('70%', 2, c.primary, 0.75)}
        {bar('44%', 0.8, c.secondary, 0.55, 2)}
        {bar('82%', 0.8, c.primary, 0.18, 4)}
      </div>
      <div style={{ width: '100%', height: 2, background: `${c.secondary}55` }} />
    </div>
  );

  /* ── Cinematic (graduation): dark letterbox ── */
  if (layout === 'cinematic') return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg" style={{ background: '#080808' }}>
      <div style={{ width: '100%', height: 8, background: '#000' }} />
      <div className="relative flex-1" style={{ background: `linear-gradient(160deg,${c.secondary}33,${c.primary}22)` }}>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-[2px] pb-1">
          {bar('78%', 2, 'rgba(255,255,255,0.90)', 1)}
          {bar('50%', 0.8, c.secondary, 0.75, 1)}
        </div>
      </div>
      <div style={{ width: '100%', height: 8, background: '#000' }} />
    </div>
  );

  /* ── Scrapbook (graduation): tilted photo, paper feel ── */
  if (layout === 'scrapbook') return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-lg" style={{ background: '#fdf8ef' }}>
      <div style={{ width: 30, height: 26, background: `linear-gradient(135deg,${c.secondary}44,${c.primary}22)`, border: `1.5px solid ${c.secondary}55`, transform: 'rotate(-4deg)', marginTop: 8, boxShadow: '1px 2px 4px rgba(0,0,0,0.10)' }} />
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2">
        {bar('64%', 2, c.primary, 0.65)}
        {bar('44%', 0.8, c.secondary, 0.45, 2)}
        {bar('76%', 0.8, c.primary, 0.18, 3)}
      </div>
    </div>
  );

  /* ── Luxury (graduation): dark, gold accents ── */
  if (layout === 'luxury') return (
    <div className="flex h-full w-full flex-col items-center overflow-hidden rounded-lg" style={{ background: '#0e0b06' }}>
      <div style={{ width: '60%', height: 0.8, background: c.secondary, opacity: 0.70, marginTop: 8 }} />
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${c.secondary}33`, border: `1px solid ${c.secondary}55`, marginTop: 5 }} />
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2">
        {bar('68%', 2, c.secondary, 0.80)}
        {bar('42%', 0.8, c.secondary, 0.45, 2)}
        {bar('78%', 0.8, 'rgba(255,255,255,0.18)', 1, 3)}
      </div>
      <div style={{ width: '60%', height: 0.8, background: c.secondary, opacity: 0.70, marginBottom: 8 }} />
    </div>
  );

  /* ── Floral (graduation): botanical, petal shapes ── */
  if (layout === 'floral') return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-lg" style={{ background: `linear-gradient(160deg,${c.accent},#fff)` }}>
      {/* petal dots */}
      {[[12,14],[88,18],[8,78],[84,72]].map(([x, y], i) => (
        <div key={i} style={{ position:'absolute', left:`${x}%`, top:`${y}%`, width: 7, height: 10, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: `${c.secondary}55`, transform: `rotate(${i*45}deg)` }} />
      ))}
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2 relative">
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${c.primary}22`, border: `1px solid ${c.primary}44`, marginBottom: 4 }} />
        {bar('64%', 2, c.primary, 0.68)}
        {bar('42%', 0.8, c.secondary, 0.45, 2)}
        {bar('76%', 0.8, c.primary, 0.18, 3)}
      </div>
    </div>
  );

  /* ── Watercolor (graduation): soft wash blobs ── */
  if (layout === 'watercolor') return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg" style={{ background: '#fefefe' }}>
      <div className="absolute" style={{ width: 50, height: 44, borderRadius: '60% 40% 50% 55%', background: `${c.primary}18`, top: -8, left: -6 }} />
      <div className="absolute" style={{ width: 44, height: 38, borderRadius: '55% 45% 40% 60%', background: `${c.secondary}18`, bottom: -6, right: -4 }} />
      <div className="relative flex flex-col items-center gap-[3px] px-2">
        {bar('58%', 2, c.primary, 0.55)}
        {bar('38%', 0.8, c.secondary, 0.40, 2)}
        {bar('72%', 0.8, c.primary, 0.15, 4)}
      </div>
    </div>
  );

  /* ── Bold (graduation): high-contrast, strong type ── */
  if (layout === 'bold') return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg" style={{ background: '#0a0a0a' }}>
      <div style={{ width: '100%', height: '35%', background: c.primary, opacity: 0.92 }} />
      <div className="flex flex-1 flex-col justify-center gap-[4px] px-2">
        {bar('84%', 3.5, 'rgba(255,255,255,0.90)', 1)}
        {bar('60%', 1.5, 'rgba(255,255,255,0.45)', 1, 2)}
        {bar('72%', 1, 'rgba(255,255,255,0.22)', 1, 3)}
      </div>
    </div>
  );

  /* ── Boho (graduation): earthy, geometric ── */
  if (layout === 'boho') return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-lg" style={{ background: '#f7f0e6' }}>
      {/* diamond */}
      <div style={{ width: 14, height: 14, background: `${c.secondary}66`, transform: 'rotate(45deg)', marginTop: 10 }} />
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2">
        {bar('62%', 2, c.primary, 0.70)}
        {bar('40%', 0.8, c.secondary, 0.50, 2)}
        {bar('74%', 0.8, c.primary, 0.20, 3)}
      </div>
      <div style={{ display:'flex', gap: 4, marginBottom: 8 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 3, height: 3, borderRadius:'50%', background: c.secondary, opacity: 0.55 }} />)}
      </div>
    </div>
  );

  /* ── Gold Dark (graduation): near-black + gold ── */
  if (layout === 'golddark') return (
    <div className="flex h-full w-full flex-col items-center overflow-hidden rounded-lg" style={{ background: '#0c0902' }}>
      <div style={{ width: '100%', height: 6, background: `linear-gradient(90deg,transparent,${c.secondary},transparent)`, opacity: 0.75, marginTop: 6 }} />
      <div className="flex flex-1 flex-col items-center justify-center gap-[3px] px-2">
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${c.secondary}22`, border: `1px solid ${c.secondary}55`, marginBottom: 4 }} />
        {bar('68%', 2.5, c.secondary, 0.82)}
        {bar('44%', 0.8, c.secondary, 0.45, 2)}
        {bar('78%', 0.8, 'rgba(255,255,255,0.15)', 1, 3)}
      </div>
      <div style={{ width: '100%', height: 6, background: `linear-gradient(90deg,transparent,${c.secondary},transparent)`, opacity: 0.75, marginBottom: 6 }} />
    </div>
  );

  /* ── Clean (profile): business card style ── */
  if (layout === 'clean') return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg" style={{ background: '#ffffff' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${c.primary}22`, border: `1.5px solid ${c.primary}44`, marginBottom: 5 }} />
      <div style={{ width: '55%', height: 0.5, background: c.primary, opacity: 0.18, marginBottom: 5 }} />
      {bar('62%', 2, c.primary, 0.70)}
      {bar('40%', 0.8, c.secondary, 0.40, 2)}
      {bar('74%', 0.8, c.primary, 0.15, 3)}
    </div>
  );

  /* ── Dark (profile): dark luxury card ── */
  if (layout === 'dark') return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg" style={{ background: '#111' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${c.secondary}44`, border: `1.5px solid ${c.secondary}55`, marginBottom: 6 }} />
      {bar('64%', 2.5, 'rgba(255,255,255,0.85)', 1)}
      {bar('42%', 0.8, c.secondary, 0.65, 2)}
      {bar('76%', 0.8, 'rgba(255,255,255,0.22)', 1, 3)}
    </div>
  );

  /* ── Creative (profile): asymmetric color block ── */
  if (layout === 'creative') return (
    <div className="flex h-full w-full overflow-hidden rounded-lg" style={{ background: '#fff' }}>
      <div style={{ width: '38%', background: `linear-gradient(180deg,${c.primary},${c.secondary})`, flexShrink: 0 }} />
      <div className="flex flex-1 flex-col justify-center gap-[3px] px-1.5 py-2">
        {bar('88%', 2.5, c.primary, 0.80)}
        {bar('70%', 1, c.secondary, 0.55, 2)}
        {bar('80%', 0.8, c.primary, 0.20, 3)}
        {bar('60%', 0.8, c.primary, 0.15)}
      </div>
    </div>
  );

  /* ── Linktree (social): stacked link-button rows ── */
  if (layout === 'linktree') return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-[5px] overflow-hidden rounded-lg px-2" style={{ background: c.accent }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${c.primary}33`, border: `1px solid ${c.primary}44`, marginBottom: 3 }} />
      {[0.88, 0.82, 0.76].map((w, i) => (
        <div key={i} style={{ width: `${w * 100}%`, height: 10, borderRadius: 5, background: i === 0 ? `${c.primary}cc` : `${c.primary}44`, border: `0.5px solid ${c.primary}33` }} />
      ))}
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
      className={`flex w-full flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all sm:w-[78px] sm:flex-shrink-0 ${
        active
          ? 'border-primary bg-primary/[0.04] scale-[1.04] shadow-md shadow-primary/20 ring-2 ring-primary/15'
          : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="h-[68px] w-full overflow-hidden rounded-lg">
        <MiniPreview layout={s.layout} c={s.colors} />
      </div>
      <span className="text-center text-[9px] font-medium leading-tight text-content2">{s.name}</span>
      {active && <div className="h-1 w-1 rounded-full bg-primary" />}
    </button>
  );
}
