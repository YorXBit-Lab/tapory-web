'use client';

import { useState, useEffect, useMemo } from 'react';
import { FD, FS, EXPO, SPR, WRAP, useFadeOut, type BaseProps } from './shared';

export function CountdownIntro({ onComplete, title }: BaseProps) {
  const [n, setN] = useState(3);
  const [showGo, setShowGo] = useState(false);
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  useEffect(() => {
    const ts = [
      setTimeout(() => setN(2), 1200),
      setTimeout(() => setN(1), 2400),
      setTimeout(() => setShowGo(true), 3600),
      setTimeout(() => trigger(), 4200),
    ];
    return () => ts.forEach(clearTimeout);
  }, [trigger]);

  const scratches = useMemo(() => [...Array(5)].map((_, i) => ({
    x: 8 + Math.random() * 84, y: 5 + Math.random() * 90,
    h: 8 + Math.random() * 18, r: (Math.random() - .5) * 12,
    delay: Math.random() * 4000, dur: 180 + Math.random() * 280,
  })), []);

  return (
    <div onClick={() => { if (!fading) trigger(); }} style={{
      ...WRAP, cursor:'pointer',
      background:'#070708',
      animation:'_cdn_film 6s ease-in-out infinite',
      ...fs,
    }}>
      {/* Film grain */}
      <svg style={{ position:'absolute', width:0, height:0 }}>
        <defs>
          <filter id="fgrain">
            <feTurbulence type="fractalNoise" baseFrequency=".88" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feBlend in="SourceGraphic" mode="overlay"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
      </svg>
      <div style={{ position:'absolute', inset:'-5%', opacity:.1, filter:'url(#fgrain)',
        background:'rgba(255,255,255,.55)',
        animation:'_cdn_grain 0.14s steps(1) infinite', pointerEvents:'none' }} />

      {/* Scan line */}
      <div style={{ position:'absolute', left:0, right:0, height:3,
        background:'rgba(255,255,255,.055)', animation:'_cdn_scan 3.5s linear infinite',
        zIndex:2, pointerEvents:'none' }} />

      {/* Burn flash on number change */}
      <div key={`b${n}`} style={{
        position:'absolute', inset:0,
        background:'rgba(255,248,220,.06)',
        animation:`_popIn 200ms ease-out forwards`,
        pointerEvents:'none', zIndex:3,
      }} />

      {/* Scratches */}
      {scratches.map((s, i) => (
        <div key={i} style={{
          position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
          width:1, height:`${s.h}%`,
          background:'rgba(255,255,255,.28)', transform:`rotate(${s.r}deg)`,
          animation:`_pulse ${s.dur}ms ${s.delay}ms ease-out infinite`,
          pointerEvents:'none', zIndex:4,
        }} />
      ))}

      {/* Sprocket holes */}
      {[...Array(8)].map((_, i) => (
        <div key={`l${i}`} style={{ position:'absolute', left:4, top:`${7+i*11.5}%`,
          width:14, height:18, border:'1.5px solid rgba(255,255,255,.1)', borderRadius:2 }} />
      ))}
      {[...Array(8)].map((_, i) => (
        <div key={`r${i}`} style={{ position:'absolute', right:4, top:`${7+i*11.5}%`,
          width:14, height:18, border:'1.5px solid rgba(255,255,255,.1)', borderRadius:2 }} />
      ))}

      {/* Center frame */}
      <div style={{ position:'relative', zIndex:5, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>

        {/* Rule line */}
        {!showGo && (
          <div key={`rule${n}`} style={{
            width:60, height:1, background:'rgba(255,255,255,.2)',
            marginBottom:20,
            animation:`_cdn_rule 1.2s ${EXPO} forwards`,
          }} />
        )}

        {!showGo ? (
          <div key={n} style={{ position:'relative', width:148, height:148 }}>
            {/* Arc timer */}
            <svg width="148" height="148" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
              <circle cx="74" cy="74" r="45" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1.5"/>
              <circle cx="74" cy="74" r="45" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.5"
                strokeDasharray="283" strokeDashoffset="283"
                style={{ animation:`_cdn_arc 1.2s linear forwards` }} />
            </svg>
            {/* Crosshairs */}
            <svg width="148" height="148" style={{ position:'absolute', inset:0 }}>
              <line x1="74" y1="6" x2="74" y2="22" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
              <line x1="74" y1="126" x2="74" y2="142" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
              <line x1="6" y1="74" x2="22" y2="74" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
              <line x1="126" y1="74" x2="142" y2="74" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
              <circle cx="74" cy="74" r="4" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1"/>
              <text x="104" y="14" fontSize="7" fill="rgba(255,255,255,.25)" fontFamily="SF Mono,monospace">{n*111}A</text>
            </svg>
            {/* Number */}
            <div style={{
              width:148, height:148, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:78, fontWeight:900, color:'#fff', fontFamily:FD,
              textShadow:'0 0 28px rgba(255,255,255,.3)',
              animation:`_cdn_num 1.2s ${EXPO} forwards`,
            }}>{n}</div>
          </div>
        ) : (
          <div style={{ fontSize:56, color:'rgba(255,255,255,.8)', animation:`_popIn .5s ${SPR} forwards` }}>▶</div>
        )}

        {/* Title strip */}
        <div style={{ marginTop:20, opacity:.5 }}>
          <div style={{ width:50, height:.5, background:'rgba(255,255,255,.3)', margin:'0 auto 8px' }} />
          <p style={{ margin:0, fontSize:8, color:'rgba(255,255,255,.4)', letterSpacing:'.28em',
            textTransform:'uppercase', fontFamily:'SF Mono,ui-monospace,monospace' }}>
            {title || 'TAPORY'}
          </p>
        </div>
      </div>

      <p style={{ position:'absolute', bottom:26, fontSize:8, letterSpacing:'.22em',
        color:'rgba(255,255,255,.15)', textTransform:'uppercase', fontFamily:FS }}>
        chạm để bỏ qua
      </p>
    </div>
  );
}
