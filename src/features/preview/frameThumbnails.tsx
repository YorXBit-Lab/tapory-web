import type React from 'react';

const corners: { pos: React.CSSProperties; tf: string }[] = [
  { pos: { top: 0, left: 0 },       tf: 'none'        },
  { pos: { top: 0, right: 0 },      tf: 'scaleX(-1)'  },
  { pos: { bottom: 0, left: 0 },    tf: 'scaleY(-1)'  },
  { pos: { bottom: 0, right: 0 },   tf: 'scale(-1,-1)'},
];

export const FRAME_THUMBNAIL: Record<string, React.ReactNode> = {
  none: (
    <div className="h-full w-full rounded border-2 border-dashed border-border bg-elevated" />
  ),

  minimal: (
    <div className="h-full w-full rounded bg-white"
      style={{ boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,0.22), inset 0 0 0 3px rgba(0,0,0,0.06)' }} />
  ),

  floral: (
    <div className="relative h-full w-full overflow-hidden rounded bg-white">
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 0 1px rgba(249,168,212,0.5)' }} />
      {corners.map(({ pos, tf }, i) => (
        <div key={i} className="absolute" style={{ ...pos, transform: tf }}>
          <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
            <path d="M3 25 C8 15 15 8 25 3" stroke="#86efac" strokeWidth="1.8" />
            <circle cx="6"  cy="22" r="3"   fill="#fda4af" />
            <circle cx="22" cy="6"  r="3"   fill="#fda4af" />
            <circle cx="13" cy="13" r="2.5" fill="#f43f5e" />
          </svg>
        </div>
      ))}
    </div>
  ),

  'grad-border': (
    <div className="h-full w-full rounded"
      style={{
        backgroundColor: '#f8f6f0',
        boxShadow: 'inset 0 0 0 1.5px #c9a93c, inset 0 0 0 3.5px #1a2744, inset 0 0 0 5px #c9a93c',
      }} />
  ),

  cute: (
    <div className="relative h-full w-full rounded bg-white"
      style={{ boxShadow: 'inset 0 0 0 2px #f9a8d4, inset 0 0 0 3.5px #fce7f3' }}>
      {corners.map(({ pos }, i) => (
        <svg key={i} className="absolute" style={pos} width="9" height="9" viewBox="0 0 18 18">
          {i % 2 === 0
            ? <path d="M9 14 L3 8 Q3 4 7 4 Q9 6 9 6 Q9 4 11 4 Q15 4 15 8 Z" fill="#f472b6" />
            : <polygon points="9,1 11,7 17,7 12,11 14,17 9,13 4,17 6,11 1,7 7,7" fill="#fbbf24" />
          }
        </svg>
      ))}
    </div>
  ),

  luxury: (
    <div className="relative h-full w-full rounded"
      style={{
        backgroundColor: '#111',
        boxShadow: 'inset 0 0 0 1.5px #c9a93c, inset 0 0 0 3px rgba(0,0,0,0.5), inset 0 0 0 4.5px #c9a93c',
      }}>
      {corners.map(({ pos }, i) => (
        <span key={i} className="absolute" style={{ ...pos, fontSize: 5, lineHeight: 1, color: '#c9a93c' }}>✦</span>
      ))}
    </div>
  ),

  geometric: (
    <div className="relative h-full w-full overflow-hidden rounded bg-white"
      style={{ boxShadow: 'inset 0 0 0 0.5px rgba(99,102,241,0.3)' }}>
      {corners.map(({ pos, tf }, i) => (
        <div key={i} className="absolute" style={{ ...pos, transform: tf }}>
          <svg width="14" height="14" viewBox="0 0 28 28">
            <defs>
              <linearGradient id={`gthumb${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <polygon points="0,0 28,0 0,28" fill={`url(#gthumb${i})`} opacity="0.9" />
          </svg>
        </div>
      ))}
    </div>
  ),

  vintage: (
    <div className="relative h-full w-full rounded"
      style={{
        backgroundColor: '#faf6ee',
        boxShadow: 'inset 0 0 0 1.5px #c8a96a, inset 0 0 0 3px #faf6ee, inset 0 0 0 4.5px #a07840',
      }}>
      {corners.map(({ pos, tf }, i) => (
        <div key={i} className="absolute" style={{ ...pos, transform: tf }}>
          <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
            <path d="M2 18 Q6 12 12 6 Q16 2 18 2" stroke="#a07840" strokeWidth="1.5" />
            <circle cx="2.5" cy="17.5" r="2" fill="#c8a96a" />
          </svg>
        </div>
      ))}
    </div>
  ),

  popup: (
    <div className="relative h-full w-full overflow-hidden rounded bg-white"
      style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }}>
      {([
        { pos: { top: 0, left: 0 },     color: '#fbbf24', pts: '0,0 16,0 0,16'   },
        { pos: { top: 0, right: 0 },    color: '#f472b6', pts: '0,0 16,0 16,16'  },
        { pos: { bottom: 0, left: 0 },  color: '#a78bfa', pts: '0,0 0,16 16,16'  },
        { pos: { bottom: 0, right: 0 }, color: '#34d399', pts: '16,0 0,16 16,16' },
      ] as { pos: React.CSSProperties; color: string; pts: string }[]).map(({ pos, color, pts }, i) => (
        <div key={i} className="absolute" style={pos}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <polygon points={pts} fill={color} />
          </svg>
        </div>
      ))}
    </div>
  ),
};
