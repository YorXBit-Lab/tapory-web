'use client';

import { useState, useCallback, useMemo } from 'react';
import { FD, FS, EXPO, SPR, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function RoseIntro({ onComplete, title }: BaseProps) {
  type Ph = 'idle' | 'bloom' | 'shower';
  const [ph, setPh] = useState<Ph>('idle');
  const { fading, trigger, style: fs } = useFadeOut(onComplete, 1000);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('bloom');
    setTimeout(() => setPh('shower'), 1500);
    setTimeout(() => trigger(), 5800);
  }, [ph, fading, trigger]);

  // 54 petals — 3 depth layers (fg/mid/bg): varied size, speed, drift, opacity
  const petals = useMemo(() => [...Array(54)].map((_, i) => {
    const d = i % 3; // depth: 0=foreground 1=mid 2=background
    return {
      left:  `${3 + (i * 7.1 + (i % 5) * 13) % 92}%`,
      sx:    `${(i % 2 ? 1 : -1) * (12 + (i * 33) % 88)}px`,
      sr:    `${(i % 2 ? 1 : -1) * (55 + (i * 61) % 430)}deg`,
      delay: (i * 107) % 2800,
      dur:   d === 0 ? 3.2 + (i * 0.19) % 2.6 : d === 1 ? 4.0 + (i * 0.22) % 3.0 : 5.2 + (i * 0.25) % 3.6,
      so:    d === 0 ? 0.72 + (i % 4) * 0.07 : d === 1 ? 0.52 + (i % 5) * 0.06 : 0.28 + (i % 4) * 0.06,
      size:  d === 0 ? 11 + (i * 7) % 10 : d === 1 ? 8 + (i * 7) % 9 : 6 + (i * 5) % 7,
      color: ['#ffc4d6','#ffd6e6','#ffe8f2','#ffb0c8','#ffdde8','#ffa8c0'][i % 6],
      d,
    };
  }), []);

  // 15 blossoms — placed along the SVG branch (viewBox 0 0 320 480)
  const flowers = useMemo(() => [
    { x: 60, y:283, delay:  18, fs:.83, fr:-19 },
    { x: 29, y:215, delay:  78, fs:.70, fr: 11 },
    { x: 73, y:226, delay: 132, fs:.68, fr: 28 },
    { x:118, y:360, delay:  52, fs:.91, fr:-22 },
    { x:143, y:342, delay: 106, fs:.79, fr: 16 },
    { x:168, y:310, delay: 160, fs:.87, fr:  7 },
    { x:199, y:289, delay:  88, fs:.93, fr:-11 },
    { x:213, y:213, delay: 208, fs:.76, fr: 23 },
    { x:200, y:157, delay: 292, fs:.66, fr:-14 },
    { x:223, y:157, delay: 328, fs:.63, fr: 33 },
    { x:256, y:251, delay: 148, fs:.89, fr: -7 },
    { x:297, y:231, delay: 192, fs:.81, fr: 19 },
    { x:315, y:166, delay: 260, fs:.73, fr:-20 },
    { x:327, y:116, delay: 308, fs:.61, fr: 13 },
    { x: 83, y:335, delay:  36, fs:.74, fr: -4 },
  ], []);

  const bloom = ph === 'bloom' || ph === 'shower';

  // 3 petal colour variants cycling per flower
  const PK = [
    'radial-gradient(ellipse at 48% 82%, #fffaf8 0%, #ffd8e8 36%, #ffb4cc 66%, #ff92b4 100%)',
    'radial-gradient(ellipse at 48% 82%, #fffcfc 0%, #ffe4ef 36%, #ffc4d8 66%, #ffa0be 100%)',
    'radial-gradient(ellipse at 48% 82%, #fff6f8 0%, #ffccd8 36%, #ffaac4 66%, #ff88aa 100%)',
  ];

  // Petal SVG path: 5-petal sakura shape, base at bottom, notched tip
  // viewBox "0 0 20 30" — base at (10,29), tip at (10,0), notch via Q
  const PETAL = 'M10,29C3,23,1,15,2,8C3,1,6,-1,9,-1Q10,3,11,-1C14,-1,17,1,18,8C19,15,17,23,10,29Z';
  const VEIN  = 'M10,29L10,-1';

  return (
    <div onClick={tap} style={{ ...WRAP, cursor:ph==='idle'?'pointer':'default', overflow:'hidden', ...fs }}>

      {/* ── L1 · Deep midnight sky ── */}
      <div style={{ position:'absolute', inset:0, zIndex:0,
        background:'linear-gradient(180deg,#12081f 0%,#1c0e2e 30%,#2a1540 58%,#381a44 100%)' }} />

      {/* ── L2 · Atmospheric haze ── */}
      <div style={{ position:'absolute', inset:'-5% -5%', zIndex:1, pointerEvents:'none',
        background:'radial-gradient(ellipse 110% 48% at 48% 62%,rgba(130,60,165,.07) 0%,transparent 68%)',
        animation:'_sak_haze 22s ease-in-out infinite' }} />

      {/* ── L3 · Cloud wisps ── */}
      <div style={{ position:'absolute', top:'12%', left:'-8%', right:'-8%', height:'20%',
        zIndex:1, pointerEvents:'none',
        background:[
          'radial-gradient(ellipse 75% 100% at 28% 50%,rgba(180,140,210,.04) 0%,transparent 56%)',
          'radial-gradient(ellipse 55% 100% at 72% 50%,rgba(155,115,200,.03) 0%,transparent 52%)',
        ].join(','),
        animation:'_sak_haze 30s 5s ease-in-out infinite' }} />

      {/* ── L4 · Ambient bloom glow ── */}
      <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none',
        background:'radial-gradient(ellipse 65% 42% at 44% 56%,rgba(210,110,165,.05) 0%,transparent 68%)' }} />

      {/* ── L5 · Pink aurora (post-bloom only) ── */}
      {bloom && (
        <div style={{ position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
          background:'radial-gradient(ellipse 90% 58% at 43% 50%,rgba(255,115,165,.10) 0%,rgba(190,60,115,.05) 40%,transparent 70%)',
          animation:`_sak_sky .85s ${EXPO} forwards,_sak_aurora 11s 1.4s ease-in-out infinite` }} />
      )}

      {/* ── Moon ── */}
      <div style={{ position:'absolute', top:'9%', right:'13%', zIndex:6, pointerEvents:'none' }}>
        {/* Outer corona */}
        <div style={{ position:'absolute', top:'50%', left:'50%', width:96, height:96,
          transform:'translate(-50%,-50%)', borderRadius:'50%',
          background:'radial-gradient(circle,rgba(255,218,80,.07) 0%,rgba(255,200,55,.03) 42%,transparent 70%)',
          animation:'_sak_halo 7s ease-in-out infinite' }} />
        {/* Mid halo */}
        <div style={{ position:'absolute', top:'50%', left:'50%', width:60, height:60,
          transform:'translate(-50%,-50%)', borderRadius:'50%',
          background:'radial-gradient(circle,rgba(255,230,120,.12) 0%,transparent 66%)' }} />
        {/* Moon face */}
        <div style={{ position:'relative', width:40, height:40, borderRadius:'50%', overflow:'hidden',
          background:'radial-gradient(circle at 36% 30%,#fffef4 0%,#fff4d2 28%,#ffe8a0 58%,#f8d868 100%)',
          boxShadow:'inset -3px -3px 9px rgba(175,115,18,.18),inset 2px 2px 6px rgba(255,255,232,.65)',
          animation:'_sak_moon 5.5s ease-in-out infinite' }}>
          {/* Natural surface texture */}
          <div style={{ position:'absolute', inset:0, borderRadius:'50%',
            background:[
              'radial-gradient(circle at 64% 60%,rgba(188,135,28,.1) 0%,transparent 36%)',
              'radial-gradient(circle at 28% 72%,rgba(168,120,18,.08) 0%,transparent 26%)',
            ].join(',') }} />
        </div>
      </div>

      {/* ── Stars (18 sharp + 6 soft-blur) ── */}
      {[...Array(24)].map((_,i) => (
        <div key={i} style={{ position:'absolute', zIndex:3, pointerEvents:'none',
          left:`${(i*71+13)%87+5}%`, top:`${(i*43+9)%44+3}%`,
          width: i%5===0?2.8:i%3===0?2:1.4,
          height: i%5===0?2.8:i%3===0?2:1.4,
          borderRadius:'50%', background:'#fff',
          opacity:.13+(i%8)*.07,
          filter: i%7===0?'blur(0.7px)':'none',
          animation:`_twinkle ${1.5+(i%6)*.42}s ${i*.19}s ease-in-out infinite`,
        }} />
      ))}

      {/* ── Branch + Blossoms (SVG coordinate system 320×480) ── */}
      <div style={{ position:'absolute', bottom:'-2%', left:'-4%', zIndex:8, pointerEvents:'none',
        width:'84vw', height:'calc(84vw * 1.5)',
        maxWidth:500, maxHeight:750 }}>

        {/* Branch SVG */}
        <svg viewBox="0 0 320 480" width="100%" height="100%"
          style={{ position:'absolute', inset:0 }} preserveAspectRatio="xMinYMax meet">

          {/* Soft drop shadow */}
          <g transform="translate(3,6)" style={{ filter:'blur(5px)' }} opacity=".55">
            <path d="M10,475C45,438,82,395,118,362C148,334,174,310,200,288C224,268,258,248,298,232"
              fill="none" stroke="#000" strokeWidth="13" strokeLinecap="round"/>
            <path d="M118,362C98,336,76,310,58,282" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round"/>
          </g>

          {/* Main trunk — 3-stroke bark system */}
          <path d="M10,475C45,438,82,395,118,362C148,334,174,310,200,288C224,268,258,248,298,232"
            fill="none" stroke="#1d0b07" strokeWidth="11.5" strokeLinecap="round"/>
          <path d="M10,475C45,438,82,395,118,362C148,334,174,310,200,288C224,268,258,248,298,232"
            fill="none" stroke="rgba(95,46,18,.35)" strokeWidth="4.5" strokeLinecap="round"/>
          <path d="M10,475C45,438,82,395,118,362C148,334,174,310,200,288C224,268,258,248,298,232"
            fill="none" stroke="rgba(185,100,55,.07)" strokeWidth="1.8" strokeLinecap="round"/>

          {/* Sub-branch upper-left */}
          <path d="M118,362C98,336,76,310,58,282" fill="none" stroke="#1d0b07" strokeWidth="8" strokeLinecap="round"/>
          <path d="M118,362C98,336,76,310,58,282" fill="none" stroke="rgba(95,46,18,.30)" strokeWidth="3" strokeLinecap="round"/>

          {/* Sub-branch upper */}
          <path d="M200,288C204,265,210,240,214,214" fill="none" stroke="#1d0b07" strokeWidth="6.5" strokeLinecap="round"/>
          <path d="M200,288C204,265,210,240,214,214" fill="none" stroke="rgba(95,46,18,.28)" strokeWidth="2.2" strokeLinecap="round"/>

          {/* Far-right extension */}
          <path d="M298,232C305,214,314,193,317,170" fill="none" stroke="#1d0b07" strokeWidth="5.5" strokeLinecap="round"/>
          <path d="M298,232C305,214,314,193,317,170" fill="none" stroke="rgba(95,46,18,.26)" strokeWidth="2" strokeLinecap="round"/>

          {/* Fine twigs */}
          <path d="M58,282C46,260,36,238,28,214" fill="none" stroke="#1d0b07" strokeWidth="4" strokeLinecap="round"/>
          <path d="M58,282C68,260,72,240,74,216" fill="none" stroke="#1d0b07" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M214,214C218,196,222,176,224,158" fill="none" stroke="#1d0b07" strokeWidth="4" strokeLinecap="round"/>
          <path d="M214,214C208,196,204,178,202,158" fill="none" stroke="#1d0b07" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M317,170C321,152,325,132,327,112" fill="none" stroke="#1d0b07" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M317,170C310,155,306,136,306,116" fill="none" stroke="#1d0b07" strokeWidth="3" strokeLinecap="round"/>
        </svg>

        {/* Cherry blossoms — positioned as % of SVG coords */}
        {flowers.map((f, fi) => (
          <div key={fi} style={{ position:'absolute',
            left:`${(f.x/320)*100}%`, top:`${(f.y/480)*100}%`,
            transform:'translate(-50%,-50%)',
            width:32, height:32,
            '--fs':f.fs, '--fr':`${f.fr}deg`,
            opacity: bloom ? undefined : 0,
            animation: bloom ? `_sak_bud .66s ${f.delay}ms ${SPR} both` : 'none',
          } as React.CSSProperties}>

            {/* 5 petals using SVG path for notched sakura shape */}
            {[0,72,144,216,288].map((ang,pi) => (
              <svg key={pi} width="13" height="16" viewBox="0 0 20 30"
                style={{ position:'absolute', left:'50%', top:'50%',
                  marginLeft:-6.5, marginTop:-14,
                  transformOrigin:'50% 100%',
                  transform:`rotate(${ang}deg)`,
                  overflow:'visible',
                }}>
                <defs>
                  <radialGradient id={`pg${fi}${pi}`} cx="48%" cy="82%" r="62%">
                    <stop offset="0%"   stopColor={fi%3===0?'#fffaf8':fi%3===1?'#fffcfc':'#fff6f8'}/>
                    <stop offset="38%"  stopColor={fi%3===0?'#ffd8e8':fi%3===1?'#ffe4ef':'#ffccd8'}/>
                    <stop offset="68%"  stopColor={fi%3===0?'#ffb4cc':fi%3===1?'#ffc4d8':'#ffaac4'}/>
                    <stop offset="100%" stopColor={fi%3===0?'#ff92b4':fi%3===1?'#ffa0be':'#ff88aa'}/>
                  </radialGradient>
                </defs>
                <path d={PETAL} fill={`url(#pg${fi}${pi})`}
                  style={{ filter:'drop-shadow(0 -1px 2px rgba(200,60,100,.14))' }}/>
                <path d={VEIN} stroke="rgba(240,155,185,.22)" strokeWidth=".6" fill="none"/>
              </svg>
            ))}

            {/* Stamen centre disc */}
            <div style={{ position:'absolute', left:'50%', top:'50%',
              transform:'translate(-50%,-50%)', zIndex:3,
              width:7, height:7, borderRadius:'50%',
              background:'radial-gradient(circle at 35% 28%,#fffde2 0%,#ffe448 55%,#f0bc18 100%)',
              boxShadow:'0 0 8px rgba(255,210,35,.9)',
            }} />
            {/* 7 stamen filament dots */}
            {[0,51,103,154,206,257,309].map((a,si) => (
              <div key={si} style={{ position:'absolute', zIndex:3,
                left:`calc(50% + ${(Math.cos(a*Math.PI/180)*5.8).toFixed(1)}px - 1.5px)`,
                top: `calc(50% + ${(Math.sin(a*Math.PI/180)*5.8).toFixed(1)}px - 1.5px)`,
                width:3, height:3, borderRadius:'50%',
                background:'#ffd636', opacity:.88,
              }} />
            ))}
          </div>
        ))}
      </div>

      {/* ── Ambient petals on idle (5 slow) ── */}
      {ph === 'idle' && petals.slice(0,5).map((p,i) => (
        <div key={`ap${i}`} style={{ position:'absolute', left:p.left, top:'-20px',
          zIndex:11, pointerEvents:'none',
          animation:`_sak_fall ${p.dur+1.6}s ${p.delay+2000}ms linear infinite`,
          '--sx':p.sx, '--sr':p.sr, '--so':p.so,
        } as React.CSSProperties}>
          <svg width={p.size} height={p.size*1.15} viewBox="0 0 20 30" fill="none">
            <path d={PETAL} fill={p.color} opacity=".82"/>
            <path d={VEIN} stroke="rgba(255,155,185,.2)" strokeWidth=".6"/>
          </svg>
        </div>
      ))}

      {/* ── Full petal shower (depth-layered) ── */}
      {ph === 'shower' && petals.map((p,i) => (
        <div key={`sp${i}`} style={{ position:'absolute', left:p.left, top:'-20px',
          zIndex: p.d===0?12:p.d===1?11:10,
          pointerEvents:'none',
          animation:`_sak_fall ${p.dur}s ${p.delay}ms linear infinite`,
          '--sx':p.sx, '--sr':p.sr, '--so':p.so,
        } as React.CSSProperties}>
          <svg width={p.size} height={p.size*1.15} viewBox="0 0 20 30" fill="none"
            style={p.d===2?{filter:'blur(1px)'}:undefined}>
            <path d={PETAL} fill={p.color} opacity={p.d===2?'.55':'.88'}/>
            <path d={VEIN} stroke="rgba(255,155,185,.18)" strokeWidth=".6"/>
          </svg>
        </div>
      ))}

      {/* ── Title reveal ── */}
      {bloom && (
        <p style={{ position:'absolute', bottom:'20%', left:'5%', right:'5%',
          margin:0, textAlign:'center', zIndex:14,
          fontSize:14, fontFamily:FD, fontStyle:'italic',
          color:'rgba(255,198,222,.92)',
          textShadow:'0 1px 20px rgba(255,100,158,.5)',
          letterSpacing:'.025em',
          animation:`_riseIn .9s .75s ${EXPO} both`,
        }}>
          {title || '🌸 Dành tặng bạn'}
        </p>
      )}

      {/* ── Tap prompt ── */}
      {ph === 'idle' && (
        <div style={{ position:'absolute', bottom:'20%', left:0, right:0,
          zIndex:14, textAlign:'center', animation:'_hint 2.6s ease-in-out infinite' }}>
          <p style={{ margin:0, fontSize:9, letterSpacing:'.25em', textTransform:'uppercase',
            color:'rgba(255,168,202,.28)', fontFamily:FS }}>
            chạm để hoa nở
          </p>
          <div style={{ width:1, height:16, background:'rgba(255,168,202,.1)', margin:'10px auto 0' }} />
        </div>
      )}

      {/* ── L6 · Cinematic bottom fog ── */}
      <div style={{ position:'absolute', bottom:0, left:'-6%', right:'-6%', height:'18%',
        zIndex:9, pointerEvents:'none',
        background:'linear-gradient(to top,rgba(125,48,78,.09) 0%,rgba(155,75,120,.04) 45%,transparent 100%)',
        borderRadius:'50% 50% 0 0/28% 28% 0 0',
        animation:'_sak_mist 11s ease-in-out infinite',
      }} />

      {/* ── L6b · Lower mist glow ── */}
      <div style={{ position:'absolute', bottom:'12%', left:'-5%', right:'-5%', height:'12%',
        zIndex:8, pointerEvents:'none',
        background:'radial-gradient(ellipse 100% 100% at 50% 100%,rgba(200,100,160,.05) 0%,transparent 70%)',
        animation:'_sak_mist 14s 2s ease-in-out infinite',
      }} />

      <Skip onClick={trigger} />
    </div>
  );
}
