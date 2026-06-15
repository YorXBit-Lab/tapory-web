'use client';

import { useState, useCallback, useMemo } from 'react';
import { FD, FS, EXPO, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function ReelIntro({ onComplete, primaryColor, title }: BaseProps) {
  type Ph = 'idle' | 'counting' | 'projecting';
  const [ph, setPh] = useState<Ph>('idle');
  const [count, setCount] = useState(3);
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('counting');
    setTimeout(() => setCount(2), 900);
    setTimeout(() => setCount(1), 1800);
    setTimeout(() => { setPh('projecting'); setCount(0); }, 2700);
    setTimeout(() => trigger(), 4600);
  }, [ph, fading, trigger]);

  const sprockets = useMemo(() => [...Array(6)].map((_, i) => ({ t: 8 + i * 16 })), []);

  return (
    <div onClick={tap} style={{
      ...WRAP,
      cursor: ph === 'idle' ? 'pointer' : 'default',
      background:'#040404',
      ...fs,
    }}>
      {/* Film strip chrome + grain */}
      {ph !== 'projecting' && (
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',
          animation: ph === 'counting' ? `_rl_flicker 1.5s steps(1) infinite` : 'none' }}>
          {sprockets.map((s, i) => (
            <div key={`L${i}`} style={{ position:'absolute',left:6,top:`${s.t}%`,
              width:10,height:14,border:'1.5px solid rgba(255,255,255,.18)',
              borderRadius:2,background:'rgba(0,0,0,.75)' }} />
          ))}
          {sprockets.map((s, i) => (
            <div key={`R${i}`} style={{ position:'absolute',right:6,top:`${s.t}%`,
              width:10,height:14,border:'1.5px solid rgba(255,255,255,.18)',
              borderRadius:2,background:'rgba(0,0,0,.75)' }} />
          ))}
          <div style={{ position:'absolute',inset:0,opacity:.038,
            backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            animation:'_cdn_grain .48s steps(1) infinite' }} />
          <div style={{ position:'absolute',inset:0,
            background:'radial-gradient(ellipse at center,rgba(255,180,80,.04) 0%,rgba(20,10,4,.38) 100%)',
            mixBlendMode:'multiply' as const }} />
        </div>
      )}

      {/* Countdown */}
      {ph === 'counting' && count > 0 && (
        <div style={{ position:'relative',zIndex:5,textAlign:'center' }}>
          <svg width="110" height="110" style={{ position:'absolute',inset:0 }}>
            <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2"/>
            {[...Array(12)].map((_, i) => (
              <line key={i}
                x1={55 + 48 * Math.cos(i / 12 * Math.PI * 2 - Math.PI / 2)}
                y1={55 + 48 * Math.sin(i / 12 * Math.PI * 2 - Math.PI / 2)}
                x2={55 + (i % 3 === 0 ? 38 : 42) * Math.cos(i / 12 * Math.PI * 2 - Math.PI / 2)}
                y2={55 + (i % 3 === 0 ? 38 : 42) * Math.sin(i / 12 * Math.PI * 2 - Math.PI / 2)}
                stroke="rgba(255,255,255,.25)" strokeWidth="1.2" />
            ))}
          </svg>
          <div style={{ width:110,height:110,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span key={count} style={{ fontSize:56,fontWeight:900,color:'#fff',
              fontFamily:'Georgia,serif',textShadow:'0 0 28px rgba(255,255,255,.38)',
              animation:`_rl_num .85s ${EXPO} both` }}>{count}</span>
          </div>
          <div style={{ position:'absolute',left:0,right:0,height:2,top:0,
            background:'rgba(255,255,255,.16)',
            animation:`_rl_scan 1.8s linear infinite` }} />
        </div>
      )}

      {/* Idle: clapboard + prompt */}
      {ph === 'idle' && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:16,zIndex:2 }}>
          <div style={{ position:'relative',width:60,height:48 }}>
            <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#1e1e1e,#2e2e2e)',
              borderRadius:3,border:'2px solid #484848',
              display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span style={{ fontSize:18,color:'rgba(255,255,255,.4)' }}>▶</span>
            </div>
            <div style={{ position:'absolute',top:-11,left:-2,right:-2,height:13,
              background:'repeating-linear-gradient(90deg,#f0f0f0 0,#f0f0f0 9px,#111 9px,#111 18px)',
              borderRadius:'2px 2px 0 0',border:'1.5px solid #484848',borderBottom:'none',
              transform:'rotate(-7deg)',transformOrigin:'bottom left' }} />
          </div>
          <p style={{ margin:0,fontSize:14,fontFamily:FD,color:'rgba(255,255,255,.68)',
            letterSpacing:'.02em' }}>{title || 'Ký ức điện ảnh'}</p>
          <p style={{ margin:0,fontSize:9,letterSpacing:'.26em',textTransform:'uppercase',
            color:'rgba(255,255,255,.22)',fontFamily:FS,animation:'_hint 2.4s ease-in-out infinite' }}>
            chạm để chiếu phim
          </p>
        </div>
      )}

      {/* Projector beam reveal */}
      {ph === 'projecting' && (
        <>
          <div style={{ position:'absolute',inset:0,
            background:`linear-gradient(180deg,${primaryColor}28 0%,rgba(0,0,0,.2) 55%,rgba(0,0,0,.5) 100%)`,
            animation:`_rl_beam 1.1s ${EXPO} both`,pointerEvents:'none' }} />
          <div style={{ position:'relative',zIndex:5,display:'flex',flexDirection:'column',
            alignItems:'center',gap:14,padding:'0 24px',textAlign:'center',
            animation:`_dst_mem .65s .85s ${EXPO} both` }}>
            <p style={{ margin:0,fontSize:20,fontFamily:FD,fontWeight:700,color:'#fff',
              letterSpacing:'.015em',
              textShadow:`0 0 40px ${primaryColor},0 2px 14px rgba(0,0,0,.85)` }}>
              {title || '🎬 Khởi chiếu ký ức'}
            </p>
            <div style={{ width:44,height:1,background:`${primaryColor}88` }} />
          </div>
          <div style={{ position:'absolute',left:0,right:0,height:3,top:0,zIndex:6,
            background:`linear-gradient(90deg,transparent,${primaryColor}88,transparent)`,
            animation:`_rl_scan 2.2s linear infinite`,pointerEvents:'none' }} />
        </>
      )}
      <Skip onClick={trigger} dark={ph === 'projecting'} />
    </div>
  );
}
