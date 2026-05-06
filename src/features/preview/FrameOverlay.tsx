import type { IFrame } from '@/configs/types';

interface Props { frame: IFrame; }

const base = 'pointer-events-none absolute inset-0 z-20 transition-opacity duration-300';

export function FrameOverlay({ frame }: Props) {
  if (frame.id === 'none' || frame.id === 'floating') return null;

  if (frame.id === 'cinematic') return (
    <div className={base}>
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 46%, transparent 34%, rgba(0,0,0,0.56) 100%)' }} />
      <div className="absolute inset-x-0 top-0"
        style={{ height: 28, background: 'linear-gradient(to bottom, rgba(0,0,0,0.90), rgba(0,0,0,0.72))' }} />
      <div className="absolute inset-x-0 bottom-0"
        style={{ height: 28, background: 'linear-gradient(to top, rgba(0,0,0,0.90), rgba(0,0,0,0.72))' }} />
    </div>
  );

  if (frame.id === 'polaroid') return (
    <div className={base}>
      <div className="absolute inset-x-0 top-0"    style={{ height: 13, backgroundColor: '#f6f3ea' }} />
      <div className="absolute inset-y-0 left-0"   style={{ width:  13, backgroundColor: '#f6f3ea' }} />
      <div className="absolute inset-y-0 right-0"  style={{ width:  13, backgroundColor: '#f6f3ea' }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: 52, backgroundColor: '#f6f3ea' }} />
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.06)' }} />
    </div>
  );

  if (frame.id === 'glass') return (
    <div className={base}>
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 0 15px rgba(255,255,255,0.20), inset 0 0 36px rgba(255,255,255,0.05)' }} />
      <div className="absolute inset-x-0 top-0" style={{ height: 15, background: 'linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.10))' }} />
      <div className="absolute inset-y-0 left-0"  style={{ width: 15, background: 'linear-gradient(to right, rgba(255,255,255,0.35), rgba(255,255,255,0.05))' }} />
      <div className="absolute inset-y-0 right-0" style={{ width: 15, background: 'linear-gradient(to left, rgba(255,255,255,0.15), transparent)' }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: 15, background: 'linear-gradient(to top, rgba(255,255,255,0.10), transparent)' }} />
    </div>
  );

  if (frame.id === 'neon') return (
    <div className={base} style={{ boxShadow: ['inset 0 0 0 2px #00e5ff', 'inset 0 0 14px rgba(0,229,255,0.24)', '0 0 18px rgba(0,229,255,0.45)', '0 0 52px rgba(0,229,255,0.20)'].join(', ') }} />
  );

  if (frame.id === 'editorial') return (
    <div className={base}>
      <div className="absolute inset-y-0 left-0" style={{ width: 22, backgroundColor: '#0f0f0f' }}>
        <div className="absolute inset-y-0 right-0" style={{ width: 2, backgroundColor: '#c9a93c' }} />
      </div>
      <div className="absolute inset-x-0 top-0" style={{ height: 4, background: 'linear-gradient(to right, #c9a93c 0px, #c9a93c 22px, #0f0f0f 22px, #0f0f0f 36px, transparent 36px)' }} />
      <div className="absolute inset-y-0 right-0" style={{ width: 3, backgroundColor: '#0f0f0f' }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: 3, backgroundColor: '#0f0f0f' }} />
    </div>
  );

  if (frame.id === 'luxury') return (
    <div className={base}>
      <div className="absolute inset-0" style={{ boxShadow: ['inset 0 0 0 11px rgba(0,0,0,0.68)', 'inset 0 0 0 12.5px rgba(201,169,60,0.55)', 'inset 0 0 0 14px rgba(0,0,0,0.20)', 'inset 0 0 0 15.5px rgba(201,169,60,0.22)'].join(', ') }} />
      {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
        <span key={pos} className="absolute text-[10px] leading-none" style={{
          color: '#c9a93c', opacity: 0.88, textShadow: '0 0 8px rgba(201,169,60,0.65)',
          top:    pos.startsWith('t') ? 18 : undefined,
          bottom: pos.startsWith('b') ? 18 : undefined,
          left:   pos.endsWith('l')   ? 18 : undefined,
          right:  pos.endsWith('r')   ? 18 : undefined,
        }}>✦</span>
      ))}
    </div>
  );

  if (frame.id === 'scrapbook') return (
    <div className={base}>
      <div className="absolute" style={{ top: -2, left: 12, width: 50, height: 17, backgroundColor: 'rgba(254,220,40,0.75)', transform: 'rotate(-4deg)', borderRadius: 2 }} />
      <div className="absolute" style={{ top: -2, right: 12, width: 50, height: 17, backgroundColor: 'rgba(236,64,122,0.58)', transform: 'rotate(3.5deg)', borderRadius: 2 }} />
      <div className="absolute" style={{ bottom: -2, left: 12, width: 50, height: 17, backgroundColor: 'rgba(41,182,246,0.62)', transform: 'rotate(3deg)', borderRadius: 2 }} />
      <div className="absolute" style={{ bottom: -2, right: 12, width: 50, height: 17, backgroundColor: 'rgba(76,175,80,0.62)', transform: 'rotate(-3.5deg)', borderRadius: 2 }} />
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,0.055)' }} />
    </div>
  );

  if (frame.id === 'gradient') return (
    <div className={base}>
      <div className="absolute inset-x-0 top-0"    style={{ height: 13, background: 'linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#a29bfe,#fd79a8,#ff6b6b)' }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: 13, background: 'linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#a29bfe,#fd79a8,#ff6b6b)' }} />
      <div className="absolute inset-y-0 left-0"   style={{ width:  13, background: 'linear-gradient(180deg,#ff6b6b,#feca57,#48dbfb,#a29bfe,#fd79a8,#ff6b6b)' }} />
      <div className="absolute inset-y-0 right-0"  style={{ width:  13, background: 'linear-gradient(180deg,#ff6b6b,#feca57,#48dbfb,#a29bfe,#fd79a8,#ff6b6b)' }} />
    </div>
  );

  if (frame.id === 'minimal') return (
    <div className={base} style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.16), inset 0 0 0 2px rgba(255,255,255,0.05)' }} />
  );

  return null;
}
