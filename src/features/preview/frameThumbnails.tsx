import type React from 'react';

export const FRAME_THUMBNAIL: Record<string, React.ReactNode> = {
  none: (
    <div className="h-full w-full rounded border-2 border-dashed border-border bg-elevated" />
  ),
  cinematic: (
    <div className="relative h-full w-full overflow-hidden rounded bg-slate-400">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse, transparent 25%, rgba(0,0,0,0.72) 100%)' }} />
      <div className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: 'rgba(0,0,0,0.88)' }} />
      <div className="absolute inset-x-0 bottom-0 h-2" style={{ backgroundColor: 'rgba(0,0,0,0.88)' }} />
    </div>
  ),
  polaroid: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ backgroundColor: '#f6f3ea', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.06)' }}>
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: '#f6f3ea' }} />
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: '#f6f3ea' }} />
      <div className="absolute inset-y-0 right-0 w-1.5" style={{ backgroundColor: '#f6f3ea' }} />
      <div className="absolute inset-x-0 bottom-0 h-4" style={{ backgroundColor: '#f6f3ea' }} />
      <div className="absolute" style={{ inset: '6px 6px 16px 6px', backgroundColor: '#c8c8c0', borderRadius: 2 }} />
    </div>
  ),
  glass: (
    <div className="relative h-full w-full overflow-hidden rounded bg-sky-100">
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.42)' }} />
      <div className="absolute inset-x-0 top-0 h-4" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.65), transparent)' }} />
      <div className="absolute inset-y-0 left-0 w-3" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.45), transparent)' }} />
    </div>
  ),
  neon: (
    <div className="h-full w-full rounded bg-gray-900" style={{ boxShadow: 'inset 0 0 0 1.5px #00e5ff, inset 0 0 8px rgba(0,229,255,0.28), 0 0 8px rgba(0,229,255,0.5)' }} />
  ),
  editorial: (
    <div className="relative h-full w-full overflow-hidden rounded bg-gray-100">
      <div className="absolute inset-y-0 left-0 w-3.5" style={{ backgroundColor: '#0f0f0f' }}>
        <div className="absolute inset-y-0 right-0 w-0.5" style={{ backgroundColor: '#c9a93c' }} />
      </div>
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: '#0f0f0f' }} />
      <div className="absolute inset-x-0 bottom-0 h-0.5" style={{ backgroundColor: '#0f0f0f' }} />
    </div>
  ),
  luxury: (
    <div className="relative h-full w-full rounded bg-stone-200" style={{ boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.65), inset 0 0 0 4.5px rgba(201,169,60,0.6), inset 0 0 0 5.5px rgba(0,0,0,0.15)' }}>
      {(['top-0.5 left-0.5', 'top-0.5 right-0.5', 'bottom-0.5 left-0.5', 'bottom-0.5 right-0.5'] as const).map((pos, i) => (
        <span key={i} className={`absolute ${pos} text-[4.5px] leading-none`} style={{ color: '#c9a93c' }}>✦</span>
      ))}
    </div>
  ),
  scrapbook: (
    <div className="relative h-full w-full overflow-hidden rounded bg-amber-50">
      <div className="absolute" style={{ top: -1, left: 4, width: 16, height: 5, backgroundColor: 'rgba(254,220,40,0.82)', transform: 'rotate(-4deg)', borderRadius: 1 }} />
      <div className="absolute" style={{ top: -1, right: 4, width: 16, height: 5, backgroundColor: 'rgba(236,64,122,0.65)', transform: 'rotate(3deg)', borderRadius: 1 }} />
      <div className="absolute" style={{ bottom: -1, left: 4, width: 16, height: 5, backgroundColor: 'rgba(41,182,246,0.7)', transform: 'rotate(3deg)', borderRadius: 1 }} />
      <div className="absolute" style={{ bottom: -1, right: 4, width: 16, height: 5, backgroundColor: 'rgba(76,175,80,0.7)', transform: 'rotate(-3deg)', borderRadius: 1 }} />
    </div>
  ),
  gradient: (
    <div className="relative h-full w-full overflow-hidden rounded bg-white">
      <div className="absolute inset-x-0 top-0 h-2"    style={{ background: 'linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#a29bfe,#fd79a8)' }} />
      <div className="absolute inset-x-0 bottom-0 h-2" style={{ background: 'linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#a29bfe,#fd79a8)' }} />
      <div className="absolute inset-y-0 left-0 w-2"   style={{ background: 'linear-gradient(180deg,#ff6b6b,#feca57,#48dbfb,#a29bfe,#fd79a8)' }} />
      <div className="absolute inset-y-0 right-0 w-2"  style={{ background: 'linear-gradient(180deg,#ff6b6b,#feca57,#48dbfb,#a29bfe,#fd79a8)' }} />
    </div>
  ),
  minimal: (
    <div className="h-full w-full rounded bg-white" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.18)' }} />
  ),
  floating: (
    <div className="flex h-full w-full items-center justify-center rounded bg-transparent">
      <div className="h-[78%] w-[78%] rounded bg-white"
        style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.38), 0 2px 6px rgba(0,0,0,0.18)' }} />
    </div>
  ),
};
