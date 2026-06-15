'use client';

import { useState, useCallback, useMemo } from 'react';
import { FS, EXPO, CIN, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function GateIntro({ onComplete, title }: BaseProps) {
  type Ph = 'idle' | 'opening' | 'open';
  const [ph, setPh] = useState<Ph>('idle');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('opening');
    setTimeout(() => setPh('open'), 960);
    setTimeout(() => trigger(), 1800);
  }, [ph, fading, trigger]);

  const rays = useMemo(() =>
    [-24, -14, -5, 0, 5, 14, 24].map((angle, i) => ({
      angle, opacity: .2 + Math.abs(i - 3) * .035, delay: i * 38,
    })), []);

  const motes = useMemo(() => [...Array(18)].map((_, i) => ({
    mx:`${26+Math.random()*48}%`, my:`${18+Math.random()*55}%`,
    mdx:`${(Math.random()-.5)*44}px`,
    size:1+Math.random()*2, delay:Math.random()*1400, dur:2+Math.random()*2.5,
  })), []);

  const wood: React.CSSProperties = {
    backgroundImage:[
      'repeating-linear-gradient(92deg,transparent,transparent 38px,rgba(0,0,0,.04) 38px,rgba(0,0,0,.04) 40px)',
      'repeating-linear-gradient(2deg,transparent,transparent 60px,rgba(0,0,0,.035) 60px,rgba(0,0,0,.035) 62px)',
      'linear-gradient(160deg,#6a3010 0%,#4a1f08 20%,#7a3c18 40%,#582808 60%,#8a4818 80%,#6a3010 100%)',
    ].join(','),
  };

  return (
    <div onClick={tap} style={{
      ...WRAP, cursor: ph === 'idle' ? 'pointer' : 'default',
      background:'radial-gradient(ellipse at 50% 58%, rgba(255,170,50,.08) 0%, #080400 65%)',
      ...fs,
    }}>
      {/* God rays */}
      {(ph==='open') && rays.map((r, i) => (
        <div key={i} style={{
          position:'absolute', bottom:'24%', left:'50%',
          width:r.opacity>.22 ? 72 : 52, height:'90%',
          background:`linear-gradient(to top, rgba(255,195,72,.6) 0%, rgba(255,195,72,${r.opacity}) 35%, transparent 72%)`,
          transform:`rotate(${r.angle}deg)`, transformOrigin:'bottom center',
          filter:'blur(16px)',
          animation:`_gte_ray 2.2s ${r.delay}ms ${EXPO} forwards`,
          '--ro':r.opacity, zIndex:1, pointerEvents:'none',
        } as React.CSSProperties} />
      ))}

      {/* Dust motes */}
      {ph==='open' && motes.map((m, i) => (
        <div key={i} style={{
          position:'absolute', left:m.mx, top:m.my,
          width:m.size, height:m.size, borderRadius:'50%',
          background:'rgba(255,210,110,.65)',
          boxShadow:`0 0 ${m.size*3}px rgba(255,190,60,.45)`,
          animation:`_gte_mote ${m.dur}s ${m.delay}ms ${EXPO} forwards`,
          '--mx':m.mx, '--my':m.my, '--mdx':m.mdx, zIndex:6,
        } as React.CSSProperties} />
      ))}

      {/* LEFT DOOR */}
      <div style={{
        position:'absolute', top:0, left:0, width:'50%', height:'100%',
        ...wood, transformOrigin:'left center', zIndex:5,
        animation: ph!=='idle' ? `_gte_L 1.08s ${CIN} forwards` : 'none',
        boxShadow:'inset -12px 0 32px rgba(0,0,0,.6)',
      }}>
        <div style={{ position:'absolute',top:'10%',left:8,right:6,height:'34%', border:'2px solid rgba(0,0,0,.18)', borderRadius:3, boxShadow:'inset 0 3px 12px rgba(0,0,0,.32)' }} />
        <div style={{ position:'absolute',top:'52%',left:8,right:6,height:'26%', border:'2px solid rgba(0,0,0,.18)', borderRadius:3, boxShadow:'inset 0 3px 12px rgba(0,0,0,.32)' }} />
        <div style={{ position:'absolute',top:'8%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        <div style={{ position:'absolute',top:'48%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        <div style={{ position:'absolute',top:'80%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        {[17,47,74].map(t => (
          <div key={t} style={{ position:'absolute',top:`${t}%`,left:3,width:12,height:22,
            background:'linear-gradient(90deg,#a08040,#c9a93c)',borderRadius:2,
            boxShadow:'1px 1px 4px rgba(0,0,0,.5)' }} />
        ))}
        <div style={{ position:'absolute',top:'50%',right:10,transform:'translateY(-50%)',
          width:18,height:18,borderRadius:'50%',
          background:'radial-gradient(circle at 35% 30%,#f5d060,#7a5e10)',
          border:'1px solid #c9a93c',boxShadow:'1px 2px 6px rgba(0,0,0,.6)' }} />
      </div>

      {/* RIGHT DOOR */}
      <div style={{
        position:'absolute', top:0, right:0, width:'50%', height:'100%',
        ...wood, transformOrigin:'right center', zIndex:5,
        animation: ph!=='idle' ? `_gte_R 1.08s ${CIN} forwards` : 'none',
        boxShadow:'inset 12px 0 32px rgba(0,0,0,.6)',
      }}>
        <div style={{ position:'absolute',top:'10%',left:6,right:8,height:'34%', border:'2px solid rgba(0,0,0,.18)', borderRadius:3, boxShadow:'inset 0 3px 12px rgba(0,0,0,.32)' }} />
        <div style={{ position:'absolute',top:'52%',left:6,right:8,height:'26%', border:'2px solid rgba(0,0,0,.18)', borderRadius:3, boxShadow:'inset 0 3px 12px rgba(0,0,0,.32)' }} />
        <div style={{ position:'absolute',top:'8%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        <div style={{ position:'absolute',top:'48%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        <div style={{ position:'absolute',top:'80%',left:0,right:0,height:7, background:'rgba(0,0,0,.38)' }} />
        {[17,47,74].map(t => (
          <div key={t} style={{ position:'absolute',top:`${t}%`,right:3,width:12,height:22,
            background:'linear-gradient(270deg,#a08040,#c9a93c)',borderRadius:2,
            boxShadow:'-1px 1px 4px rgba(0,0,0,.5)' }} />
        ))}
        <div style={{ position:'absolute',top:'50%',left:10,transform:'translateY(-50%)',
          width:18,height:18,borderRadius:'50%',
          background:'radial-gradient(circle at 35% 30%,#f5d060,#7a5e10)',
          border:'1px solid #c9a93c',boxShadow:'-1px 2px 6px rgba(0,0,0,.6)' }} />
      </div>

      {/* Keyhole + title when closed */}
      {ph === 'idle' && (
        <div style={{ position:'absolute',zIndex:9,display:'flex',flexDirection:'column',alignItems:'center',gap:12 }}>
          <svg width="28" height="44" viewBox="0 0 28 44" style={{ filter:'drop-shadow(0 0 8px rgba(201,164,83,.65))' }}>
            <circle cx="14" cy="13" r="8.5" fill="#c9a453" opacity=".88"/>
            <circle cx="14" cy="13" r="5" fill="#080400"/>
            <path d="M10 20 L18 20 L16 40 L12 40 Z" fill="#c9a453" opacity=".88"/>
          </svg>
          <p style={{ margin:0, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
            color:'rgba(201,164,83,.42)', fontFamily:FS, animation:'_hint 2.2s ease-in-out infinite' }}>
            {title || 'chạm để mở'}
          </p>
        </div>
      )}

      {/* Light flood when open */}
      {ph==='open' && (
        <div style={{
          position:'absolute', top:0, bottom:0, left:'15%', right:'15%', zIndex:2,
          background:'radial-gradient(ellipse at 50% 68%, rgba(255,210,90,.16) 0%, transparent 60%)',
          animation:`_gte_glow .7s ${EXPO} forwards`, pointerEvents:'none',
        }} />
      )}

      <Skip onClick={trigger} />
    </div>
  );
}
