'use client';

import { useState, useCallback, useMemo } from 'react';
import { FD, FS, EXPO, SPR, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function DustIntro({ onComplete, primaryColor, title, imageUrl }: BaseProps) {
  type Ph = 'idle' | 'gathering' | 'revealed';
  const [ph, setPh] = useState<Ph>('idle');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('gathering');
    setTimeout(() => setPh('revealed'), 1100);
    setTimeout(() => trigger(), 3200);
  }, [ph, fading, trigger]);

  const particles = useMemo(() => [...Array(52)].map((_, i) => {
    const angle = (i / 52) * Math.PI * 2;
    const r = 22 + (i * 23) % 38;
    const left = Math.round(50 + Math.cos(angle) * r * 0.88);
    const top  = Math.round(50 + Math.sin(angle) * r * 0.58);
    return {
      left: `${Math.max(2, Math.min(98, left))}%`,
      top:  `${Math.max(2, Math.min(98, top))}%`,
      gx: `${50 - left}%`, gy: `${50 - top}%`,
      do: (0.18 + (i % 7) * 0.08).toFixed(2),
      size: 2 + (i % 4),
      dur: `${2.0 + (i % 6) * 0.45}s`,
      delay: `${(i * 211) % 3000}ms`,
      gdelay: `${(i * 41) % 700}ms`,
      type: i % 3,
    };
  }), []);

  return (
    <div onClick={tap} style={{
      ...WRAP,
      cursor: ph === 'idle' ? 'pointer' : 'default',
      background: `radial-gradient(ellipse at 50% 50%, ${primaryColor}12 0%, #060308 62%, #030107 100%)`,
      ...fs,
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:'radial-gradient(ellipse at center,transparent 28%,rgba(0,0,0,.75) 100%)' }} />

      {ph !== 'revealed' && particles.map((p, i) => (
        <div key={i} style={{
          position:'absolute', left:p.left, top:p.top,
          width:p.size, height:p.size,
          borderRadius: p.type === 2 ? 1 : '50%',
          background: p.type === 1
            ? `radial-gradient(circle,#fff 0%,${primaryColor} 50%,transparent 100%)`
            : `radial-gradient(circle,${primaryColor} 0%,transparent 75%)`,
          boxShadow: `0 0 ${p.size * 4}px ${primaryColor}`,
          transform: 'translate(-50%,-50%)',
          ['--do' as string]: p.do, ['--gx' as string]: p.gx, ['--gy' as string]: p.gy,
          animation: ph === 'idle'
            ? `_dst_float ${p.dur} ${p.delay} ease-in-out infinite`
            : `_dst_gather .85s ${p.gdelay} ${EXPO} forwards`,
        }} />
      ))}

      {ph === 'gathering' && (
        <div style={{
          position:'absolute', left:'50%', top:'50%',
          width:130, height:130, borderRadius:'50%',
          background:`radial-gradient(circle,${primaryColor}cc 0%,${primaryColor}44 40%,transparent 70%)`,
          animation:`_dst_glow .75s .72s ${EXPO} both`,
          pointerEvents:'none',
        }} />
      )}

      {ph === 'revealed' && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:18,
          padding:'0 28px',textAlign:'center',animation:`_dst_mem .65s ${SPR} both` }}>
          {imageUrl ? (
            <div style={{ width:112,height:112,borderRadius:'50%',overflow:'hidden',
              boxShadow:`0 0 48px ${primaryColor}66,0 0 80px ${primaryColor}28`,
              border:`2px solid ${primaryColor}55` }}>
              <img src={imageUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
            </div>
          ) : (
            <div style={{ width:88,height:88,borderRadius:'50%',
              background:`radial-gradient(circle,${primaryColor}44 0%,transparent 70%)`,
              boxShadow:`0 0 48px ${primaryColor}66`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:36 }}>✨</div>
          )}
          <p style={{ margin:0,fontSize:18,fontFamily:FD,fontWeight:700,color:'#fff',
            textShadow:`0 0 28px ${primaryColor}`,letterSpacing:'.02em' }}>
            {title || '✨ Ký ức của bạn'}
          </p>
          <p style={{ margin:0,fontSize:9,letterSpacing:'.24em',textTransform:'uppercase',
            color:`${primaryColor}88`,fontFamily:FS }}>chạm để xem</p>
        </div>
      )}

      {ph === 'idle' && (
        <div style={{ position:'absolute',bottom:'22%',left:0,right:0,textAlign:'center',
          animation:'_hint 2.6s ease-in-out infinite',pointerEvents:'none' }}>
          <p style={{ margin:0,fontSize:9,letterSpacing:'.26em',textTransform:'uppercase',
            color:`${primaryColor}55`,fontFamily:FS }}>chạm để hội tụ ký ức</p>
        </div>
      )}
      <Skip onClick={trigger} />
    </div>
  );
}
