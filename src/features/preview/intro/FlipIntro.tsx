'use client';

import { useState, useCallback, useMemo } from 'react';
import { FD, FS, EXPO, SPR, CIN, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function FlipIntro({ onComplete, primaryColor, accentColor, title }: BaseProps) {
  const [flipped, setFlipped] = useState(false);
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (flipped || fading) return;
    setFlipped(true);
    setTimeout(() => trigger(), 1400);
  }, [flipped, fading, trigger]);

  const dust = useMemo(() => [...Array(10)].map((_, i) => ({
    left:`${36+Math.random()*28}%`,
    ddx:`${(Math.random()-.5)*55}px`, ddy:`${-18-Math.random()*36}px`,
    size:1.5+Math.random()*2, delay:Math.random()*480,
  })), []);

  return (
    <div onClick={tap} style={{
      ...WRAP, cursor: flipped ? 'default' : 'pointer',
      background:'radial-gradient(ellipse at 42% 50%, #2c1808 0%, #100604 55%, #070404 100%)',
      ...fs,
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:'radial-gradient(ellipse at 42% 52%,rgba(255,150,50,.08) 0%,transparent 52%)' }} />

      {/* Dust on flip */}
      {flipped && dust.map((d, i) => (
        <div key={i} style={{
          position:'absolute', left:d.left, top:'50%',
          width:d.size, height:d.size, borderRadius:'50%',
          background:'rgba(255,170,70,.55)',
          animation:`_flp_dust 1.6s ${d.delay}ms ${EXPO} forwards`,
          '--ddx':d.ddx, '--ddy':d.ddy,
        } as React.CSSProperties} />
      ))}

      <div style={{ position:'relative', width:210, height:270 }}>
        {/* Spine */}
        <div style={{
          position:'absolute', left:-14, top:10, bottom:10, width:20,
          background:'linear-gradient(90deg,#180800,#5a2808,#281000)',
          borderRadius:'3px 0 0 3px', boxShadow:'-5px 0 18px rgba(0,0,0,.7)',
        }}>
          {[20,42,65].map(t => (
            <div key={t} style={{ position:'absolute',top:`${t}%`,left:0,right:0,height:3,
              background:'#c9a453',opacity:.55 }} />
          ))}
        </div>

        {/* Pages stack */}
        {[4,3,2,1].map(i => (
          <div key={i} style={{
            position:'absolute', inset:0,
            background:`hsl(42,${28-i*2}%,${93-i}%)`,
            borderRadius:'1px 4px 4px 1px', zIndex:i,
            transform:`translateX(${i*2}px) translateY(${i*.4}px)`,
            boxShadow:'1px 1px 3px rgba(0,0,0,.12)',
          }} />
        ))}

        {/* Inside endpapers after flip */}
        {flipped && (
          <div style={{
            position:'absolute', inset:0, zIndex:8,
            background:'linear-gradient(140deg,#fdf9f0 0%,#f6ede0 100%)',
            borderRadius:'1px 4px 4px 1px',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:24, gap:8,
            animation:`_flp_page .75s .1s ${SPR} backwards`,
            boxShadow:'2px 0 22px rgba(0,0,0,.22)',
          }}>
            {/* Marbled pattern */}
            <div style={{ position:'absolute',inset:0,opacity:.06,
              backgroundImage:'repeating-linear-gradient(45deg,#c9a453 0,#c9a453 1px,transparent 1px,transparent 16px),repeating-linear-gradient(-45deg,#c9a453 0,#c9a453 1px,transparent 1px,transparent 16px)',
              borderRadius:'1px 4px 4px 1px',
            }} />
            {/* Content */}
            <div style={{ display:'flex',alignItems:'center',gap:6,width:'78%',opacity:.6 }}>
              <div style={{ flex:1,height:'.5px',background:accentColor }} />
              <span style={{ fontSize:7,color:accentColor }}>✦</span>
              <div style={{ flex:1,height:'.5px',background:accentColor }} />
            </div>
            <p style={{ margin:0,fontSize:16,fontFamily:FD,fontWeight:700,color:'#38180a',
              textAlign:'center',lineHeight:1.45 }}>
              {title || 'Dành cho bạn'}
            </p>
            <p style={{ margin:0,fontSize:9,fontFamily:FD,fontStyle:'italic',color:'#9a6840',
              letterSpacing:'.04em' }}>một trang ký ức</p>
            <div style={{ display:'flex',alignItems:'center',gap:6,width:'78%',opacity:.6,marginTop:4 }}>
              <div style={{ flex:1,height:'.5px',background:accentColor }} />
              <span style={{ fontSize:7,color:accentColor }}>✦</span>
              <div style={{ flex:1,height:'.5px',background:accentColor }} />
            </div>
          </div>
        )}

        {/* Book cover */}
        <div style={{
          position:'absolute', inset:0, transformOrigin:'left center', zIndex:10,
          animation: flipped ? `_flp_open 1.15s ${CIN} forwards` : 'none',
        }}>
          <div style={{
            width:'100%', height:'100%',
            background:`linear-gradient(155deg, ${primaryColor} 0%, #1a0810 48%, ${primaryColor}88 100%)`,
            borderRadius:'2px 4px 4px 2px',
            boxShadow:'6px 6px 34px rgba(0,0,0,.72)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:24, position:'relative', overflow:'hidden',
          }}>
            {/* Leather grain */}
            <div style={{ position:'absolute',inset:0,opacity:.1,
              backgroundImage:'repeating-linear-gradient(32deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 7px)' }} />
            {/* Gold borders */}
            {[12,17,21].map(n => (
              <div key={n} style={{ position:'absolute',inset:n,border:`1px solid rgba(201,164,83,${.5-.12*(n/12)})`,borderRadius:2,pointerEvents:'none' }} />
            ))}
            {/* Corner ornaments */}
            {([{t:14,l:14},{t:14,r:14},{b:14,l:14},{b:14,r:14}] as unknown as React.CSSProperties[]).map((pos,i) => (
              <span key={i} style={{ position:'absolute',...pos,color:accentColor,fontSize:10,opacity:.85,
                textShadow:`0 0 5px ${accentColor}` }}>✦</span>
            ))}
            {/* Ribbon */}
            <div style={{ position:'absolute',top:-2,right:28,width:12,height:40,
              background:`linear-gradient(180deg,${accentColor},${accentColor}88)`,
              clipPath:'polygon(0 0,100% 0,100% 100%,50% 88%,0 100%)',
              boxShadow:`0 0 7px ${accentColor}44` }} />
            {/* Text */}
            <p style={{ margin:'0 0 10px',fontSize:17,fontWeight:700,color:'#fff',fontFamily:FD,
              textAlign:'center',lineHeight:1.4,textShadow:'0 2px 8px rgba(0,0,0,.5)',
              letterSpacing:'.01em' }}>
              {title || 'Dành cho bạn'}
            </p>
            <div style={{ width:48,height:.75,background:accentColor,opacity:.75 }} />
          </div>
        </div>
      </div>

      {!flipped && (
        <p style={{ marginTop:28,fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',
          color:'rgba(255,170,70,.3)',fontFamily:FS,animation:'_hint 2.4s ease-in-out infinite' }}>
          chạm để lật trang
        </p>
      )}
      <Skip onClick={trigger} />
    </div>
  );
}
