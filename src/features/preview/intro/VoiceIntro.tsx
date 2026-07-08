'use client';

import { useState, useCallback, useMemo } from 'react';
import { FD, FS, SPR, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function VoiceIntro({ onComplete, primaryColor, title, imageUrl }: BaseProps) {
  type Ph = 'idle' | 'playing' | 'revealed';
  const [ph, setPh] = useState<Ph>('idle');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('playing');
    setTimeout(() => setPh('revealed'), 2600);
    setTimeout(() => trigger(), 4500);
  }, [ph, fading, trigger]);

  const bars = useMemo(() => [...Array(30)].map((_, i) => {
    const h = 6 + ((i * 37 + 11) % 36);
    return {
      idleH: h,
      bh: (0.1 + (h / 44) * 0.8).toFixed(3),
      dur: `${0.30 + (i % 7) * 0.06}s`,
      delay: `${(i * 53) % 460}ms`,
    };
  }), []);

  return (
    <div onClick={tap} style={{
      ...WRAP,
      cursor: ph === 'idle' ? 'pointer' : 'default',
      background:'#060810',
      ...fs,
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:`radial-gradient(ellipse at 50% 44%,${primaryColor}10 0%,transparent 60%)` }} />

      {/* Blurred bg image */}
      {imageUrl && (
        <div style={{
          position:'absolute',inset:0,
          backgroundImage:`url(${imageUrl})`,
          backgroundSize:'cover',backgroundPosition:'center',
          filter: ph === 'revealed' ? 'blur(0px) brightness(.65)' : 'blur(22px) brightness(.22)',
          transition: ph === 'revealed' ? 'filter 1.1s ease' : 'none',
          transform:'scale(1.08)',
        }} />
      )}
      {ph !== 'revealed' && (
        <div style={{ position:'absolute',inset:0,background:'rgba(6,8,16,.86)',pointerEvents:'none' }} />
      )}

      {ph !== 'revealed' && (
        <div style={{ position:'relative',zIndex:2,display:'flex',flexDirection:'column',
          alignItems:'center',gap:18,width:'72%' }}>
          {/* Avatar */}
          <div style={{ width:72,height:72,borderRadius:'50%',overflow:'hidden',
            border:`2px solid ${primaryColor}44`,flexShrink:0,
            animation:'_vox_pulse 2.2s ease-in-out infinite' }}>
            {imageUrl
              ? <img src={imageUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',
                  filter:ph==='playing'?'none':'blur(8px)',transition:'filter .7s' }} />
              : <div style={{ width:'100%',height:'100%',background:`radial-gradient(circle,${primaryColor}22 0%,transparent 70%)`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>💌</div>
            }
          </div>
          {/* Title */}
          <p style={{ margin:0,fontSize:13,fontFamily:FD,color:'rgba(255,255,255,.82)',
            letterSpacing:'.01em',textAlign:'center' }}>
            {title || 'Tin nhắn thoại'}
          </p>
          {/* Waveform */}
          <div style={{ display:'flex',alignItems:'flex-end',gap:2,height:44,width:'100%' }}>
            {bars.map((bar, i) => (
              <div key={i} style={{ flex:1,height:'100%',display:'flex',
                alignItems:'flex-end',justifyContent:'center' }}>
                <div style={{
                  width:'100%',
                  height: ph === 'playing' ? '100%' : `${bar.idleH}px`,
                  borderRadius:2,
                  background: i === 14 || i === 15
                    ? primaryColor
                    : `${primaryColor}${i%3===0?'cc':i%3===1?'88':'aa'}`,
                  transformOrigin:'center',
                  ['--bh' as string]: bar.bh,
                  opacity: ph === 'playing' ? 1 : 0.42,
                  animation: ph === 'playing'
                    ? `_vox_bar ${bar.dur} ${bar.delay} ease-in-out infinite`
                    : 'none',
                }} />
              </div>
            ))}
          </div>
          {ph === 'idle' && (
            <p style={{ margin:0,fontSize:9,letterSpacing:'.24em',textTransform:'uppercase',
              color:`${primaryColor}66`,fontFamily:FS,animation:'_hint 2.2s ease-in-out infinite' }}>
              chạm để nghe
            </p>
          )}
          {ph === 'playing' && (
            <p style={{ margin:0,fontSize:10,letterSpacing:'.12em',
              color:`${primaryColor}aa`,fontFamily:FS }}>▶ đang phát…</p>
          )}
        </div>
      )}

      {ph === 'revealed' && (
        <div style={{ position:'relative',zIndex:2,display:'flex',flexDirection:'column',
          alignItems:'center',gap:14,padding:'0 28px',textAlign:'center',
          animation:`_dst_mem .7s ${SPR} both` }}>
          <p style={{ margin:0,fontSize:19,fontFamily:FD,fontWeight:700,color:'#fff',
            textShadow:'0 2px 20px rgba(0,0,0,.8)',letterSpacing:'.02em' }}>
            {title || 'Dành cho bạn'}
          </p>
          <div style={{ width:40,height:1,background:`${primaryColor}88` }} />
          <p style={{ margin:0,fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',
            color:'rgba(255,255,255,.42)',fontFamily:FS }}>chạm để xem</p>
        </div>
      )}
      <Skip onClick={trigger} />
    </div>
  );
}
