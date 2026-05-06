import type React from 'react';

const DOT = (color: string, style?: React.CSSProperties) => (
  <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color, flexShrink: 0, ...style }} />
);

export const EFFECT_THUMBNAIL: Record<string, React.ReactNode> = {
  none: (
    <div className="h-full w-full rounded border-2 border-dashed border-border bg-elevated" />
  ),

  fireworks: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ backgroundColor: '#0a0a1a' }}>
      {([
        { left: '30%', top: '30%', color: '#ff6b6b' },
        { left: '65%', top: '22%', color: '#ffd93d' },
        { left: '50%', top: '55%', color: '#4d96ff' },
      ] as { left: string; top: string; color: string }[]).map((b, bi) =>
        ([[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]] as [number,number][]).map(([dx, dy], di) => (
          <div key={`${bi}-${di}`} style={{
            position: 'absolute',
            left: `calc(${b.left} + ${dx * 9}px)`,
            top:  `calc(${b.top}  + ${dy * 9}px)`,
            width: 3, height: 3, borderRadius: '50%',
            backgroundColor: b.color,
            opacity: 0.85,
          }} />
        ))
      )}
    </div>
  ),

  confetti: (
    <div className="relative h-full w-full overflow-hidden rounded bg-white">
      {(['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#f72585','#ff9f1c','#a8dadc','#e63946'] as string[]).map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${10 + i * 11}%`,
          top:  `${15 + (i % 3) * 22}%`,
          width: 4 + (i % 3),
          height: 5 + (i % 2),
          backgroundColor: c,
          borderRadius: 1,
          transform: `rotate(${i * 28}deg)`,
          opacity: 0.88,
        }} />
      ))}
    </div>
  ),

  snow: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ background: 'linear-gradient(160deg,#1a2744,#0f172a)' }}>
      {([
        { x: '15%', y: '20%', s: 5 }, { x: '40%', y: '50%', s: 7 }, { x: '70%', y: '15%', s: 4 },
        { x: '85%', y: '60%', s: 6 }, { x: '28%', y: '72%', s: 5 }, { x: '58%', y: '35%', s: 4 },
        { x: '75%', y: '80%', s: 3 },
      ] as { x: string; y: string; s: number }[]).map((f, i) => (
        <div key={i} style={{
          position: 'absolute', left: f.x, top: f.y,
          width: f.s, height: f.s, borderRadius: '50%',
          backgroundColor: 'rgba(220,238,255,0.9)',
          boxShadow: '0 0 4px rgba(255,255,255,0.8)',
        }} />
      ))}
    </div>
  ),

  hearts: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ background: 'linear-gradient(160deg,#fff0f3,#ffe0eb)' }}>
      {(['#ff6b6b','#f72585','#ffb3c1','#ff6b6b','#f72585'] as string[]).map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          left:    `${12 + i * 17}%`,
          bottom:  `${10 + (i % 3) * 22}%`,
          fontSize: 9 + (i % 3) * 3,
          color: c,
          opacity: 0.85,
        }}>❤</div>
      ))}
    </div>
  ),

  sparkles: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ backgroundColor: '#0f0f1a' }}>
      {([
        { x: '18%', y: '20%', s: 11, g: true  },
        { x: '55%', y: '12%', s: 9,  g: false },
        { x: '78%', y: '45%', s: 13, g: true  },
        { x: '32%', y: '60%', s: 8,  g: false },
        { x: '64%', y: '72%', s: 10, g: true  },
      ] as { x: string; y: string; s: number; g: boolean }[]).map((st, i) => (
        <div key={i} style={{
          position: 'absolute', left: st.x, top: st.y,
          fontSize: st.s,
          color: st.g ? '#ffd700' : '#fff8e1',
          textShadow: st.g ? '0 0 8px #ffd700' : '0 0 6px rgba(255,255,255,0.8)',
        }}>✦</div>
      ))}
    </div>
  ),

  petals: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ background: 'linear-gradient(160deg,#fff0f5,#ffe4ef)' }}>
      {[0,1,2,3,4,5,6].map(i => (
        <div key={i} style={{
          position: 'absolute',
          left: `${8 + i * 13}%`,
          top:  `${12 + (i % 3) * 22}%`,
          width: 8, height: 6,
          borderRadius: '50% 0 50% 0',
          backgroundColor: i % 2 === 0 ? 'rgba(255,160,195,0.82)' : 'rgba(255,192,220,0.72)',
          transform: `rotate(${i * 45}deg)`,
        }} />
      ))}
    </div>
  ),

  bubbles: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ background: 'linear-gradient(160deg,#e0f7fa,#b2ebf2)' }}>
      {([
        { x: '18%', y: '65%', s: 14 }, { x: '45%', y: '55%', s: 10 }, { x: '70%', y: '60%', s: 18 },
        { x: '30%', y: '30%', s: 8  }, { x: '62%', y: '20%', s: 12 },
      ] as { x: string; y: string; s: number }[]).map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.x, top: b.y,
          width: b.s, height: b.s, borderRadius: '50%',
          border: '1.5px solid rgba(72,202,228,0.75)',
          backgroundColor: 'rgba(144,224,239,0.18)',
        }} />
      ))}
    </div>
  ),

  rain: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ background: 'linear-gradient(160deg,#1a1a2e,#0f172a)' }}>
      {[0,1,2,3,4,5,6,7].map(i => (
        <div key={i} style={{
          position: 'absolute',
          left:   `${5 + i * 12}%`,
          top:    `${8 + (i % 4) * 20}%`,
          width:  1.5,
          height: 8 + (i % 3) * 3,
          backgroundColor: ['#ffd700','#ffc300','#ffe066'][i % 3],
          borderRadius: 1,
          transform: 'rotate(20deg)',
          opacity: 0.8,
        }} />
      ))}
    </div>
  ),

  poop: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ background: '#fff8f0' }}>
      {[
        { x: '10%', y: '10%', s: 14 }, { x: '42%', y: '5%',  s: 12 },
        { x: '70%', y: '18%', s: 16 }, { x: '25%', y: '50%', s: 13 },
        { x: '60%', y: '55%', s: 15 },
      ].map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, fontSize: p.s }}>💩</div>
      ))}
    </div>
  ),

  money: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ background: 'linear-gradient(160deg,#e8f5e9,#f1f8e9)' }}>
      {[
        { x: '8%',  y: '55%', s: 13, e: '💸' }, { x: '35%', y: '35%', s: 11, e: '💵' },
        { x: '62%', y: '48%', s: 14, e: '💰' }, { x: '20%', y: '20%', s: 10, e: '🪙' },
        { x: '72%', y: '15%', s: 12, e: '💎' },
      ].map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, fontSize: p.s }}>{p.e}</div>
      ))}
    </div>
  ),

  party: (
    <div className="relative h-full w-full overflow-hidden rounded" style={{ background: 'linear-gradient(160deg,#fff8e1,#fce4ec)' }}>
      {[
        { x: '5%',  y: '8%',  s: 14, e: '🎉' }, { x: '40%', y: '4%',  s: 12, e: '🎊' },
        { x: '68%', y: '12%', s: 13, e: '🥳' }, { x: '22%', y: '48%', s: 11, e: '🎈' },
        { x: '58%', y: '52%', s: 14, e: '✨' },
      ].map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, fontSize: p.s }}>{p.e}</div>
      ))}
    </div>
  ),
};
