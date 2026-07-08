'use client';

import { useState, useCallback } from 'react';
import { FD, FS, EXPO, CIN, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function BookIntro({ onComplete, primaryColor, accentColor, title, imageUrl }: BaseProps) {
  type Ph = 'closed' | 'turning' | 'open';
  const [ph, setPh] = useState<Ph>('closed');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (ph !== 'closed' || fading) return;
    setPh('turning');
    setTimeout(() => setPh('open'), 1050);
    setTimeout(() => trigger(), 3400);
  }, [ph, fading, trigger]);

  return (
    <div onClick={tap} style={{
      ...WRAP,
      cursor: ph === 'closed' ? 'pointer' : 'default',
      background:'radial-gradient(ellipse at 46% 50%,#1c1208 0%,#0c0804 55%,#060404 100%)',
      ...fs,
    }}>
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',
        background:'radial-gradient(ellipse at 46% 50%,rgba(201,164,83,.07) 0%,transparent 55%)' }} />

      <div style={{ position:'relative',width:220,height:280 }}>
        {/* Drop shadow */}
        <div style={{ position:'absolute',left:10,top:14,width:'100%',height:'100%',
          background:'rgba(0,0,0,.55)',filter:'blur(24px)',borderRadius:6,
          animation: ph !== 'closed' ? `_bk_shadow .9s ${EXPO} forwards` : 'none' }} />

        {/* Page stack */}
        {[3, 2, 1].map(n => (
          <div key={n} style={{ position:'absolute',inset:0,
            background:`hsl(42,${22-n}%,${94-n}%)`,
            borderRadius:'2px 5px 5px 2px',zIndex:n,
            transform:`translateX(${n*2.5}px) translateY(${n*.5}px)`,
            boxShadow:'1px 1px 4px rgba(0,0,0,.14)' }} />
        ))}

        {/* Inside endpaper */}
        {(ph === 'turning' || ph === 'open') && (
          <div style={{ position:'absolute',inset:0,zIndex:8,
            background:'linear-gradient(148deg,#fdf9f0 0%,#f5ede0 100%)',
            borderRadius:'2px 5px 5px 2px',
            display:'flex',flexDirection:'column',alignItems:'center',
            justifyContent:'center',padding:22,gap:10,
            boxShadow:'3px 0 26px rgba(0,0,0,.28)',
            animation:`_bk_inner .55s .72s ${EXPO} both` }}>
            <div style={{ position:'absolute',inset:0,opacity:.05,
              backgroundImage:'repeating-linear-gradient(48deg,#c9a453 0,#c9a453 .7px,transparent .7px,transparent 12px),repeating-linear-gradient(-48deg,#c9a453 0,#c9a453 .7px,transparent .7px,transparent 12px)',
              borderRadius:'2px 5px 5px 2px' }} />
            {[12, 17].map(n => (
              <div key={n} style={{ position:'absolute',inset:n,
                border:`1px solid rgba(201,164,83,${(.48-.16*(n/12)).toFixed(2)})`,
                borderRadius:3,pointerEvents:'none' }} />
            ))}
            {imageUrl && (
              <div style={{ width:82,height:82,borderRadius:4,overflow:'hidden',
                border:'1.5px solid rgba(201,164,83,.4)',
                boxShadow:'0 3px 16px rgba(0,0,0,.22)',flexShrink:0 }}>
                <img src={imageUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              </div>
            )}
            <div style={{ display:'flex',alignItems:'center',gap:5,width:'75%' }}>
              <div style={{ flex:1,height:'.5px',background:'rgba(201,164,83,.5)' }} />
              <span style={{ fontSize:7,color:accentColor,opacity:.75 }}>✦</span>
              <div style={{ flex:1,height:'.5px',background:'rgba(201,164,83,.5)' }} />
            </div>
            <p style={{ margin:0,fontSize:16,fontFamily:FD,fontWeight:700,color:'#2c1808',
              textAlign:'center',lineHeight:1.45 }}>{title || 'Dành cho bạn'}</p>
            <p style={{ margin:0,fontSize:9,fontFamily:FD,fontStyle:'italic',color:'#9a7050',
              letterSpacing:'.04em' }}>một trang ký ức đặc biệt</p>
          </div>
        )}

        {/* Book cover — flips away */}
        <div style={{ position:'absolute',inset:0,zIndex:10,
          transformOrigin:'left center',
          backfaceVisibility:'hidden',
          WebkitBackfaceVisibility:'hidden' as const,
          animation: ph !== 'closed' ? `_bk_turn 1.18s ${CIN} forwards` : 'none' }}>
          <div style={{ width:'100%',height:'100%',
            background:`linear-gradient(158deg,${primaryColor} 0%,#180c04 48%,${primaryColor}88 100%)`,
            borderRadius:'2px 5px 5px 2px',
            boxShadow:'7px 7px 38px rgba(0,0,0,.76)',
            display:'flex',flexDirection:'column',alignItems:'center',
            justifyContent:'center',padding:26,position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',inset:0,opacity:.09,
              backgroundImage:'repeating-linear-gradient(35deg,rgba(255,255,255,.07) 0,rgba(255,255,255,.07) .8px,transparent .8px,transparent 7px)' }} />
            {[10, 15, 20].map(n => (
              <div key={n} style={{ position:'absolute',inset:n,
                border:`1px solid rgba(201,164,83,${(.56-.16*(n/10)).toFixed(2)})`,borderRadius:3 }} />
            ))}
            {([{ top:12,left:12 },{ top:12,right:12 },{ bottom:12,left:12 },{ bottom:12,right:12 }] as React.CSSProperties[]).map((pos, i) => (
              <span key={i} style={{ position:'absolute',...pos,color:accentColor,fontSize:11,opacity:.88,
                textShadow:`0 0 6px ${accentColor}` }}>✦</span>
            ))}
            <div style={{ position:'absolute',top:-2,right:30,width:10,height:42,
              background:`linear-gradient(180deg,${accentColor},${accentColor}77)`,
              clipPath:'polygon(0 0,100% 0,100% 100%,50% 88%,0 100%)',
              boxShadow:`0 0 8px ${accentColor}44` }} />
            <p style={{ margin:'0 0 10px',fontSize:16,fontWeight:700,color:'#fff',
              fontFamily:FD,textAlign:'center',lineHeight:1.4,
              textShadow:'0 2px 10px rgba(0,0,0,.55)',letterSpacing:'.015em' }}>
              {title || 'Dành cho bạn'}
            </p>
            <div style={{ width:40,height:.75,background:accentColor,opacity:.72 }} />
          </div>
        </div>
      </div>

      {ph === 'closed' && (
        <p style={{ marginTop:26,fontSize:9,letterSpacing:'.24em',textTransform:'uppercase',
          color:'rgba(201,164,83,.28)',fontFamily:FS,animation:'_hint 2.2s ease-in-out infinite' }}>
          chạm để mở sách
        </p>
      )}
      <Skip onClick={trigger} />
    </div>
  );
}
