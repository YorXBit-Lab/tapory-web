import type React from 'react';

/* Static thumbnail previews for each intro — shown in the editor picker */

export const INTRO_THUMBNAIL: Record<string, React.ReactNode> = {
  none: (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 20 }}>⬜</span>
    </div>
  ),

  letter: (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#fdf3e4,#f5e0c0)', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <svg width="34" height="24" viewBox="0 0 34 24">
        <rect x="0" y="0" width="34" height="24" rx="2" fill="#f5d890" stroke="#c9a93c" strokeWidth="1"/>
        <path d="M0 0 L17 14 L34 0 Z" fill="#e8c870" stroke="#c9a93c" strokeWidth="0.5"/>
        <circle cx="17" cy="12" r="4" fill="#c04040"/>
        <text x="17" y="14" textAnchor="middle" fontSize="5" fill="#fff">❤</text>
      </svg>
    </div>
  ),

  curtain: (
    <div style={{ width: '100%', height: '100%', borderRadius: 6, overflow: 'hidden', position: 'relative', background: '#080408' }}>
      {/* Left curtain */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '48%', height: '100%', background: 'repeating-linear-gradient(90deg, rgba(0,0,0,.2) 0, transparent 1px, transparent 5px, rgba(0,0,0,.1) 6px), linear-gradient(180deg,#8b1010,#6a0808)', borderRadius: '3px 0 0 3px' }} />
      {/* Right curtain */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '48%', height: '100%', background: 'repeating-linear-gradient(90deg, rgba(0,0,0,.2) 0, transparent 1px, transparent 5px, rgba(0,0,0,.1) 6px), linear-gradient(180deg,#8b1010,#6a0808)', borderRadius: '0 3px 3px 0' }} />
      {/* Gold strip top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#c9a93c,#f0d060,#c9a93c)' }} />
      {/* Center glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,220,100,.25) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 8, color: '#f0d060', fontWeight: 700, letterSpacing: 1, textShadow: '0 1px 4px rgba(0,0,0,.8)' }}>✦</span>
      </div>
    </div>
  ),

  polaroid: (
    <div style={{ width: '100%', height: '100%', background: '#111', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', width: 28, height: 34, borderRadius: 2, boxShadow: '0 3px 10px rgba(0,0,0,.5)', display: 'flex', flexDirection: 'column', padding: '2px 2px 0', transform: 'rotate(-5deg)' }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg,#e8c0d0,#c8a0b8)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 8 }}>🌟</span>
        </div>
        <div style={{ height: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 4, color: '#888', fontFamily: 'cursive' }}>memory</span>
        </div>
      </div>
    </div>
  ),

  countdown: (
    <div style={{ width: '100%', height: '100%', background: '#060606', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Sprockets */}
      {[0,1,2].map(i => <div key={i} style={{ position: 'absolute', left: 2, top: `${22 + i * 22}%`, width: 4, height: 6, border: '1px solid rgba(255,255,255,.18)', borderRadius: 1 }} />)}
      {[0,1,2].map(i => <div key={i} style={{ position: 'absolute', right: 2, top: `${22 + i * 22}%`, width: 4, height: 6, border: '1px solid rgba(255,255,255,.18)', borderRadius: 1 }} />)}
      <div style={{ position: 'relative' }}>
        <svg width="36" height="36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2"/>
          <line x1="18" y1="4" x2="18" y2="8" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
          <line x1="18" y1="28" x2="18" y2="32" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
          <line x1="4" y1="18" x2="8" y2="18" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
          <line x1="28" y1="18" x2="32" y2="18" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: 'serif' }}>3</span>
      </div>
    </div>
  ),

  typewriter: (
    <div style={{ width: '100%', height: '100%', background: 'radial-gradient(ellipse,#0e102a,#050610)', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: 4 }}>
      <div style={{ width: '90%', height: 1, background: 'rgba(100,120,240,.4)' }} />
      <p style={{ margin: 0, fontSize: 5, color: 'rgba(255,255,255,.7)', fontFamily: 'Georgia,serif', fontStyle: 'italic', textAlign: 'center', letterSpacing: .3, lineHeight: 1.6 }}>
        Có một điều muốn<br/>nói với bạn...
      </p>
      <div style={{ width: 1, height: 7, background: 'rgba(255,255,255,.8)', marginLeft: 2 }} />
    </div>
  ),

  rose: (
    <div style={{ width: '100%', height: '100%', background: 'radial-gradient(ellipse,#1a0510,#060208)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(232,66,106,.2) 0%,transparent 70%)' }} />
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <div key={i} style={{
          position: 'absolute', width: 9, height: 11, borderRadius: '50% 50% 30% 50%',
          background: `rgba(232,66,106,${.6 + (i%3)*.1})`,
          transform: `rotate(${a}deg) translateY(-12px)`,
          transformOrigin: 'center 12px',
        }} />
      ))}
      <span style={{ fontSize: 16, filter: 'drop-shadow(0 0 6px rgba(232,66,106,.8))', zIndex: 1 }}>🌹</span>
    </div>
  ),

  lock: (
    <div style={{ width: '100%', height: '100%', background: 'radial-gradient(ellipse,#3d0a28,#1a0410)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="40" height="40" viewBox="0 0 110 110">
        <path d="M55 95 C20 73 5 52 5 32 C5 18 16 8 30 8 C38 8 46 13 55 22 C64 13 72 8 80 8 C94 8 105 18 105 32 C105 52 90 73 55 95Z" fill="#e8427a" opacity=".9"/>
        <g transform="translate(35,28)">
          <rect x="2" y="18" width="36" height="26" rx="4" fill="rgba(0,0,0,.4)"/>
          <path d="M8 18 V12 C8 5 32 5 32 12 V18" fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="20" cy="32" r="5" fill="rgba(255,255,255,.6)"/>
        </g>
      </svg>
    </div>
  ),

  gate: (
    <div style={{ width: '100%', height: '100%', borderRadius: 6, overflow: 'hidden', position: 'relative', background: 'radial-gradient(ellipse,rgba(255,200,80,.1),#080400)' }}>
      {/* Left door */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'repeating-linear-gradient(90deg,transparent 0,transparent 12px,rgba(0,0,0,.08) 12px,rgba(0,0,0,.08) 14px),linear-gradient(160deg,#7c4010,#5a2c08,#8b4818)' }}>
        <div style={{ position: 'absolute', top: '20%', left: 3, right: 3, height: '30%', border: '1.5px solid rgba(0,0,0,.25)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', top: '50%', right: 4, transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: '#c9a93c' }} />
      </div>
      {/* Right door */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'repeating-linear-gradient(90deg,transparent 0,transparent 12px,rgba(0,0,0,.08) 12px,rgba(0,0,0,.08) 14px),linear-gradient(160deg,#7c4010,#5a2c08,#8b4818)' }}>
        <div style={{ position: 'absolute', top: '20%', left: 3, right: 3, height: '30%', border: '1.5px solid rgba(0,0,0,.25)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', top: '50%', left: 4, transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: '#c9a93c' }} />
      </div>
      {/* Gold seam */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 2, height: '100%', background: 'linear-gradient(180deg,#c9a93c,#f0d060,#c9a93c)' }} />
      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#c9a93c,#f0d060,#c9a93c)' }} />
    </div>
  ),

  flip: (
    <div style={{ width: '100%', height: '100%', background: 'radial-gradient(ellipse,#2a1a0e,#120a04)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative' }}>
        {/* Spine */}
        <div style={{ position: 'absolute', left: -3, top: 2, bottom: 2, width: 5, background: '#3d1800', borderRadius: '2px 0 0 2px' }} />
        {/* Pages */}
        {[2,1].map(i => <div key={i} style={{ position: 'absolute', inset: 0, background: '#f5f0e8', borderRadius: '0 2px 2px 0', transform: `translateX(${i}px)` }} />)}
        {/* Cover */}
        <div style={{ width: 26, height: 34, background: 'linear-gradient(160deg,#c45c8a,#2a0a18)', borderRadius: '1px 2px 2px 1px', boxShadow: '2px 2px 8px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 2, border: '1px solid rgba(255,255,255,.2)', borderRadius: 1 }} />
          <span style={{ fontSize: 10 }}>📖</span>
        </div>
      </div>
    </div>
  ),

  scratch: (
    <div style={{ width: '100%', height: '100%', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#b8882a,#e8c050,#f5d060,#e8c050,#b8882a)' }} />
      {[20,40,55,70,85].map((y, i) => (
        <div key={i} style={{
          position: 'absolute', top: `${y}%`, left: `${10 + i * 8}%`, right: `${5 + (4-i) * 7}%`,
          height: 2, background: 'rgba(255,255,255,.5)', borderRadius: 1,
          transform: `rotate(${(i-2) * 3}deg)`,
        }} />
      ))}
      <div style={{ position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%', background: 'rgba(255,255,255,.25)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.4))' }}>🪙</span>
      </div>
    </div>
  ),

  dust: (
    <div style={{ width: '100%', height: '100%', borderRadius: 6, position: 'relative', background: 'radial-gradient(ellipse at 50% 50%,#1a0a2a,#060308)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(180,100,255,.18) 0%,transparent 65%)' }} />
      {[
        { l:'22%',t:'28%',s:3,o:.7 },{ l:'72%',t:'20%',s:2,o:.5 },{ l:'45%',t:'65%',s:4,o:.6 },
        { l:'15%',t:'55%',s:2,o:.4 },{ l:'80%',t:'45%',s:3,o:.65 },{ l:'58%',t:'30%',s:2,o:.45 },
        { l:'30%',t:'75%',s:2,o:.55 },{ l:'68%',t:'70%',s:3,o:.5 },
      ].map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.l, top: p.t,
          width: p.s, height: p.s, borderRadius: '50%', transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle,#c87aff 0%,transparent 75%)',
          boxShadow: '0 0 6px #a050f0', opacity: p.o }} />
      ))}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: 18, height: 18, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(200,100,255,.7) 0%,transparent 70%)',
        boxShadow: '0 0 12px rgba(180,80,255,.8)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, opacity: .7 }}>✨</span>
      </div>
    </div>
  ),

  voice: (
    <div style={{ width: '100%', height: '100%', borderRadius: 6, background: '#060810', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 6px' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'radial-gradient(circle,rgba(100,150,255,.25) 0%,transparent 70%)', border: '1.5px solid rgba(100,150,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 10 }}>💌</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 18, width: '88%' }}>
        {[5,9,14,7,16,11,5,18,8,13,6,15,9,12,17,7,14,10,6,13].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}px`, maxHeight: '100%', borderRadius: 1.5,
            background: i === 9 || i === 10 ? 'rgba(100,150,255,.9)' : `rgba(100,150,255,${.35 + (i%3)*.15})` }} />
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 4, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(100,150,255,.4)', fontFamily: 'sans-serif' }}>TAP TO PLAY</p>
    </div>
  ),

  universe: (
    <div style={{ width: '100%', height: '100%', borderRadius: 6, position: 'relative', background: 'radial-gradient(ellipse at 50% 46%,#0c0a1c,#030206)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(120,80,255,.14) 0%,transparent 65%)' }} />
      {[
        { l:'18%',t:'22%',s:1.5 },{ l:'72%',t:'16%',s:1 },{ l:'42%',t:'12%',s:2 },
        { l:'82%',t:'38%',s:1.5 },{ l:'28%',t:'48%',s:1 },{ l:'62%',t:'55%',s:1 },
        { l:'14%',t:'65%',s:1.5 },{ l:'78%',t:'68%',s:2 },{ l:'48%',t:'75%',s:1 },
        { l:'35%',t:'32%',s:1 },  { l:'88%',t:'24%',s:1.5 },{ l:'55%',t:'42%',s:3 },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: s.l, top: s.t,
          width: s.s, height: s.s, borderRadius: '50%', transform: 'translate(-50%,-50%)',
          background: i === 11 ? 'radial-gradient(circle,#e0c8ff 0%,#9060f0 50%,transparent 80%)' : '#fff',
          boxShadow: i === 11 ? '0 0 8px #9060f0' : 'none',
          opacity: i === 11 ? 1 : 0.5 + (i % 4) * 0.12 }} />
      ))}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: 16, height: 16, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(180,140,255,.6) 0%,transparent 70%)',
        filter: 'blur(3px)' }} />
    </div>
  ),

  reel: (
    <div style={{ width: '100%', height: '100%', borderRadius: 6, background: '#040404', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ position: 'absolute', left: 3, top: `${18 + i * 24}%`, width: 5, height: 8, border: '1px solid rgba(255,255,255,.18)', borderRadius: 1 }} />
      ))}
      {[0,1,2].map(i => (
        <div key={i} style={{ position: 'absolute', right: 3, top: `${18 + i * 24}%`, width: 5, height: 8, border: '1px solid rgba(255,255,255,.18)', borderRadius: 1 }} />
      ))}
      <div style={{ position: 'relative' }}>
        <svg width="38" height="38">
          <circle cx="19" cy="19" r="16" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1.5"/>
          {[0,90,180,270].map(a => (
            <line key={a}
              x1={19 + 16*Math.cos(a*Math.PI/180)} y1={19 + 16*Math.sin(a*Math.PI/180)}
              x2={19 + 11*Math.cos(a*Math.PI/180)} y2={19 + 11*Math.sin(a*Math.PI/180)}
              stroke="rgba(255,255,255,.22)" strokeWidth="1.2"/>
          ))}
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'Georgia,serif', textShadow: '0 0 10px rgba(255,255,255,.4)' }}>3</span>
      </div>
    </div>
  ),

  book: (
    <div style={{ width: '100%', height: '100%', borderRadius: 6, background: 'radial-gradient(ellipse at 46% 50%,#1c1208,#060404)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 34, height: 44 }}>
        {/* Spine */}
        <div style={{ position: 'absolute', left: -4, top: 2, bottom: 2, width: 6, background: 'linear-gradient(90deg,#1a0800,#4a2408)', borderRadius: '2px 0 0 2px' }} />
        {/* Pages */}
        {[2,1].map(n => <div key={n} style={{ position: 'absolute', inset: 0, background: `hsl(42,22%,${93-n}%)`, borderRadius: '0 2px 2px 0', transform: `translateX(${n*2}px)` }} />)}
        {/* Cover */}
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(158deg,#c45c8a,#180c04)', borderRadius: '1px 3px 3px 1px', boxShadow: '3px 3px 12px rgba(0,0,0,.6)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 3, border: '1px solid rgba(201,164,83,.45)', borderRadius: 1 }} />
          <div style={{ position: 'absolute', top: -1, right: 6, width: 4, height: 12, background: '#f0d060', clipPath: 'polygon(0 0,100% 0,100% 100%,50% 88%,0 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 9, opacity: .8 }}>📖</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
