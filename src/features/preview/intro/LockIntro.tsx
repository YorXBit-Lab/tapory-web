'use client';

import { useState, useCallback, useMemo } from 'react';
import { FD, FS, EXPO, SPR, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function LockIntro({ onComplete, primaryColor, title }: BaseProps) {
  type Ph = 'idle' | 'cracking' | 'glowing' | 'burst';
  const [ph, setPh] = useState<Ph>('idle');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('cracking');
    setTimeout(() => setPh('glowing'), 740);
    setTimeout(() => setPh('burst'),   1140);
    setTimeout(() => trigger(),        2150);
  }, [ph, fading, trigger]);

  // Heart path — 120×120 viewBox, smooth 6-segment bezier
  const HP = 'M60,96 C42,84 8,65 8,42 C8,28 18,18 32,18 C40,18 48,22 60,34 C72,22 80,18 88,18 C102,18 112,28 112,42 C112,65 78,84 60,96Z';

  // 8 gem facets [points, w=white|b=black, opacity]
  const facets = useMemo<[string,'w'|'b',number][]>(() => [
    ['60,34 32,18 60,50', 'w', .18], ['60,34 60,50 88,18', 'w', .10],
    ['32,18 8,42  60,50', 'w', .13], ['88,18 60,50 112,42','w', .06],
    ['8,42  22,74 60,50', 'w', .08], ['112,42 60,50 98,74','b', .06],
    ['22,74 60,96 60,50', 'b', .04], ['98,74 60,50  60,96','b', .10],
  ], []);

  // deterministic shards (no Math.random → stable SSR)
  const shards = useMemo(() => [...Array(10)].map((_,i) => ({
    sx: `${Math.cos((i/10)*Math.PI*2) * (44 + (i*17)%37)}px`,
    sy: `${Math.sin((i/10)*Math.PI*2) * (44 + (i*13)%33)}px`,
    sr: `${(i*67)%340 - 170}deg`,
    size: 9+(i%3)*5, delay: (i*8)%80,
  })), []);

  const confetti = useMemo(() => [...Array(18)].map((_,i) => ({
    cx:`${((i*43+7)%160)-80}px`, cy:`${35+((i*31)%110)}px`,
    cr:`${((i*97)%480)-240}deg`,
    color:['#f06090','#f0d060','#60c0f0','#90f060','#f09060'][i%5],
    size:5+(i%4), delay:(i*14)%250,
  })), []);

  // 8 radial spark rays
  const sparks = useMemo(() => [...Array(8)].map((_,i) => {
    const a = (i/8)*Math.PI*2 - Math.PI/2;
    return { sx:`${Math.round(Math.cos(a)*82)}px`, sy:`${Math.round(Math.sin(a)*82)}px`,
      delay:i*22, w:i%2===0?3:2, h:i%2===0?20:14 };
  }), []);

  // 12 ambient motes
  const motes = useMemo(() => [...Array(12)].map((_,i) => ({
    x:  [10,22,35,52,65,78,88, 6,42,58,74,84][i],
    y:  [20,68,32,82,15,55,28,48,72,38,62,85][i],
    s:  [ 3, 5, 4, 6, 3, 4, 5, 3, 4, 5, 3, 4][i],
    o:  [.20,.15,.25,.10,.18,.14,.22,.16,.12,.20,.15,.18][i],
    d: i*0.32, dur:2.2+(i%4)*0.7,
  })), []);

  return (
    <div onClick={tap} style={{
      ...WRAP, cursor: ph==='idle' ? 'pointer' : 'default',
      background:`radial-gradient(ellipse at 50% 38%, ${primaryColor}20 0%, #0e0510 58%, #070408 100%)`,
      ...fs,
    }}>
      {/* Vignette */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.52) 100%)' }} />

      {/* ── Ambient motes ── */}
      {motes.map((m,i) => (
        <div key={i} style={{ position:'absolute', left:`${m.x}%`, top:`${m.y}%`,
          width:m.s, height:m.s, borderRadius:'50%', transform:'translate(-50%,-50%)' }}>
          <div style={{
            width:'100%', height:'100%', borderRadius:'50%',
            background:`radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
            ['--mo' as string]: m.o.toFixed(3),
            animation:`_hrt_mote ${m.dur}s ${m.d.toFixed(2)}s ease-in-out infinite`,
          }} />
        </div>
      ))}

      {/* ── Ambient halo ── */}
      <div style={{ position:'absolute', left:'50%', top:'42%', transform:'translate(-50%,-50%)' }}>
        <div style={{
          width:230, height:230, borderRadius:'50%',
          background:`radial-gradient(circle, ${primaryColor}28 0%, transparent 68%)`,
          animation: ph==='glowing'
            ? `_hrt_glow .35s ease-in-out infinite`
            : `_hrt_glow 3.2s ease-in-out infinite`,
        }} />
      </div>

      {/* ── Burst effects (zero-size anchor at screen center) ── */}
      {ph==='burst' && (
        <div style={{ position:'absolute', left:'50%', top:'42%', width:0, height:0, zIndex:4 }}>
          {/* Expanding ring */}
          <div style={{
            position:'absolute', left:0, top:0,
            width:110, height:110, borderRadius:'50%',
            border:`2px solid ${primaryColor}`,
            animation:`_hrt_burst .85s ${EXPO} forwards`,
          }} />
          {/* Spark rays */}
          {sparks.map((s,i) => (
            <div key={i} style={{
              position:'absolute', left:0, top:0,
              width:s.w, height:s.h, borderRadius:2,
              background:`linear-gradient(to bottom, ${primaryColor}, transparent)`,
              ['--sx' as string]:s.sx, ['--sy' as string]:s.sy,
              animation:`_hrt_spark .65s ${s.delay}ms ${EXPO} forwards`,
            }} />
          ))}
          {/* Confetti */}
          {confetti.map((c,i) => (
            <div key={i} style={{
              position:'absolute', left:0, top:0,
              width:c.size, height:c.size*1.6, background:c.color, borderRadius:2,
              ['--cx' as string]:c.cx, ['--cy' as string]:c.cy, ['--cr' as string]:c.cr,
              animation:`_hrt_conf .95s ${c.delay}ms ${EXPO} forwards`,
            }} />
          ))}
          {/* Shards */}
          {shards.map((s,i) => (
            <div key={i} style={{
              position:'absolute', left:0, top:0,
              width:s.size, height:s.size,
              background:`linear-gradient(135deg, ${primaryColor}, ${primaryColor}88)`,
              clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
              ['--sx' as string]:s.sx, ['--sy' as string]:s.sy, ['--sr' as string]:s.sr,
              animation:`_hrt_shard .72s ${s.delay}ms ${EXPO} forwards`,
            }} />
          ))}
        </div>
      )}

      {/* ── Heart + Lock ── */}
      {ph !== 'burst' && (
        <div style={{
          position:'relative', zIndex:2,
          ['--hc' as string]: primaryColor,
          animation: ph==='idle'    ? '_hrt_pulse 2.8s ease-in-out infinite'
                    : ph==='cracking'? `_hrt_shake .75s ease-in-out`
                    : ph==='glowing' ? '_hrt_pulse .32s ease-in-out infinite'
                    : 'none',
        }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <radialGradient id="_hg_hl" cx="32%" cy="22%" r="65%">
                <stop offset="0%"   stopColor="white" stopOpacity=".55"/>
                <stop offset="55%"  stopColor="white" stopOpacity=".04"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="_hg_dk" cx="68%" cy="72%" r="55%">
                <stop offset="0%"   stopColor="black" stopOpacity="0"/>
                <stop offset="100%" stopColor="black" stopOpacity=".38"/>
              </radialGradient>
              <filter id="_hg_gl" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Base fill */}
            <path d={HP} fill={primaryColor} filter="url(#_hg_gl)"/>
            {/* 8 gem facets */}
            {facets.map(([pts,col,op],i) => (
              <polygon key={i} points={pts} fill={col==='w'?'white':'black'} opacity={op}/>
            ))}
            {/* Light overlay — bright top-left */}
            <path d={HP} fill="url(#_hg_hl)"/>
            {/* Dark edge */}
            <path d={HP} fill="url(#_hg_dk)"/>
            {/* Rim highlight */}
            <path d={HP} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
            {/* Glint dots */}
            <circle cx="38" cy="26" r="3.5" fill="rgba(255,255,255,.55)"/>
            <circle cx="30" cy="34" r="1.5" fill="rgba(255,255,255,.38)"/>
            <circle cx="90" cy="26" r="1.8" fill="rgba(255,255,255,.28)"/>

            {/* 3 crack lines */}
            {ph==='cracking' && (<>
              <line x1="60" y1="44" x2="46" y2="68"
                stroke="rgba(255,220,228,.85)" strokeWidth="1.2"
                strokeDasharray="27" strokeDashoffset="27"
                style={{ animation:'_hrt_crack .3s ease-out forwards','--cl':'27' } as React.CSSProperties}/>
              <line x1="60" y1="44" x2="74" y2="70"
                stroke="rgba(255,210,220,.72)" strokeWidth="1.2"
                strokeDasharray="30" strokeDashoffset="30"
                style={{ animation:'_hrt_crack .3s .06s ease-out forwards','--cl':'30' } as React.CSSProperties}/>
              <line x1="60" y1="44" x2="52" y2="28"
                stroke="rgba(255,210,220,.50)" strokeWidth=".8"
                strokeDasharray="18" strokeDashoffset="18"
                style={{ animation:'_hrt_crack .22s .04s ease-out forwards','--cl':'18' } as React.CSSProperties}/>
            </>)}

            {/* ── Lock ── centered at ~(60,50) */}
            <g transform="translate(43,22)">
              {/* Shackle shadow */}
              <path d="M9,23 L9,13 A9,12,0,0,1,27,13 L27,23"
                fill="none" stroke="rgba(0,0,0,.38)" strokeWidth="6" strokeLinecap="round"/>
              {/* Shackle body */}
              <path d="M9,23 L9,13 A9,12,0,0,1,27,13 L27,23"
                fill="none" stroke="rgba(0,0,0,.60)" strokeWidth="4.5" strokeLinecap="round"/>
              {/* Shackle highlight */}
              <path d="M9,23 L9,13 A9,12,0,0,1,27,13 L27,23"
                fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.8" strokeLinecap="round"/>
              {/* Body shadow */}
              <rect x="1" y="22" width="34" height="24" rx="5.5" fill="rgba(0,0,0,.28)"/>
              {/* Body */}
              <rect x="0" y="21" width="34" height="24" rx="5.5" fill="rgba(0,0,0,.58)"/>
              {/* Body top shine */}
              <rect x="2" y="22.5" width="30" height="9" rx="4" fill="rgba(255,255,255,.13)"/>
              {/* Keyhole circle */}
              <circle cx="17" cy="32" r="5.2" fill="rgba(255,255,255,.50)"/>
              {/* Keyhole slot */}
              <rect x="15" y="34" width="4" height="7" rx="1.5" fill="rgba(255,255,255,.44)"/>
            </g>
          </svg>
        </div>
      )}

      {/* ── Text ── */}
      <div style={{ marginTop:20, textAlign:'center', zIndex:2 }}>
        <p style={{ margin:'0 0 6px', fontSize:14, fontWeight:500, fontFamily:FD,
          color:'rgba(255,255,255,.85)', letterSpacing:'.01em' }}>
          {title || 'Dành cho bạn'}
        </p>
        {ph==='idle' && (
          <p style={{ margin:0, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
            color:`${primaryColor}88`, fontFamily:FS, animation:'_hint 2.4s ease-in-out infinite' }}>
            chạm để mở khóa
          </p>
        )}
        {ph==='burst' && (
          <p style={{ margin:0, fontSize:12, color:primaryColor, fontWeight:600, fontFamily:FD,
            animation:`_popIn .35s ${SPR} forwards` }}>
            💝 Đã mở khóa
          </p>
        )}
      </div>
      <Skip onClick={trigger}/>
    </div>
  );
}
