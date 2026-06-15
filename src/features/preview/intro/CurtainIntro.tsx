'use client';

import { useState, useCallback, useMemo } from 'react';
import { FD, FS, EXPO, CIN, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function CurtainIntro({ onComplete, title }: BaseProps) {
  const [open, setOpen] = useState(false);
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const tap = useCallback(() => {
    if (open || fading) return;
    setOpen(true);
    setTimeout(() => trigger(), 1100);
  }, [open, fading, trigger]);

  // Velvet fold layers
  const foldL = useMemo(() => [
    { w:'54%', bg:'#1c0808', shadow:'inset -12px 0 28px rgba(0,0,0,.5)' },
    { w:'44%', bg:'#200a0a', shadow:'inset -8px 0 18px rgba(0,0,0,.4)' },
    { w:'34%', bg:'#180606', shadow:'inset -6px 0 14px rgba(0,0,0,.35)' },
    { w:'24%', bg:'#1e0909', shadow:'inset -4px 0 10px rgba(0,0,0,.3)' },
    { w:'14%', bg:'#160606', shadow:'inset -3px 0 8px rgba(0,0,0,.25)' },
  ], []);

  return (
    <div onClick={tap} style={{ ...WRAP, cursor: open ? 'default' : 'pointer', background:'#030104', ...fs }}>

      {/* Warm center glow from behind */}
      {open && (
        <div style={{
          position:'absolute', top:0, bottom:0, left:'10%', right:'10%', zIndex:1,
          background:'radial-gradient(ellipse at 50% 48%, rgba(255,210,130,.18) 0%, rgba(255,180,80,.08) 40%, transparent 75%)',
          animation:`_crt_light 900ms ${EXPO} forwards`,
        }} />
      )}

      {/* LEFT CURTAIN PANEL */}
      <div style={{
        position:'absolute', top:0, left:0, width:'53%', height:'100%', zIndex:10,
        transformOrigin:'left center',
        animation: open ? `_crt_L 1050ms ${CIN} forwards` : 'none',
      }}>
        {foldL.map((f,i) => (
          <div key={i} style={{
            position:'absolute', top:0, left:0, width:f.w, height:'100%',
            background:f.bg, boxShadow:f.shadow, zIndex:5-i,
          }}>
            {/* Vertical weave texture */}
            {i === 0 && (
              <div style={{ position:'absolute', inset:0, opacity:.08,
                backgroundImage:'repeating-linear-gradient(180deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 5px)' }} />
            )}
          </div>
        ))}
        {/* Gold fringe bottom */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:18, zIndex:6,
          backgroundImage:'repeating-linear-gradient(90deg,#c9a453 0,#c9a453 2px,transparent 2px,transparent 9px)',
          opacity:.65 }} />
        {/* Tie-back suggestion */}
        <div style={{ position:'absolute', top:'58%', right:6, width:10, height:36,
          background:'radial-gradient(circle at 40% 30%,#e8c878,#8a6010)',
          borderRadius:5, opacity:.8, boxShadow:'0 2px 10px rgba(0,0,0,.6)' }} />
      </div>

      {/* RIGHT CURTAIN PANEL */}
      <div style={{
        position:'absolute', top:0, right:0, width:'53%', height:'100%', zIndex:10,
        transformOrigin:'right center',
        animation: open ? `_crt_R 1050ms ${CIN} forwards` : 'none',
      }}>
        {foldL.map((f,i) => (
          <div key={i} style={{
            position:'absolute', top:0, right:0, width:f.w, height:'100%',
            background:f.bg,
            boxShadow:f.shadow.replace('-12px','12px').replace('-8px','8px').replace('-6px','6px').replace('-4px','4px').replace('-3px','3px'),
            zIndex:5-i,
          }}>
            {i === 0 && (
              <div style={{ position:'absolute', inset:0, opacity:.08,
                backgroundImage:'repeating-linear-gradient(180deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 5px)' }} />
            )}
          </div>
        ))}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:18, zIndex:6,
          backgroundImage:'repeating-linear-gradient(90deg,#c9a453 0,#c9a453 2px,transparent 2px,transparent 9px)',
          opacity:.65 }} />
        <div style={{ position:'absolute', top:'58%', left:6, width:10, height:36,
          background:'radial-gradient(circle at 40% 30%,#e8c878,#8a6010)',
          borderRadius:5, opacity:.8, boxShadow:'0 2px 10px rgba(0,0,0,.6)' }} />
      </div>

      {/* Center seam & prompt */}
      {!open && (
        <div style={{ position:'absolute', zIndex:11, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          {/* Monogram */}
          <div style={{ width:28, height:28, borderRadius:'50%',
            border:'1px solid rgba(201,164,83,.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 14px rgba(201,164,83,.2)',
          }}>
            <span style={{ fontSize:11, color:'#c9a453', fontFamily:FD, fontWeight:700 }}>T</span>
          </div>
          <p style={{ margin:0, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
            color:'rgba(201,164,83,.45)', fontFamily:FS, animation:'_hint 2.8s ease-in-out infinite' }}>
            {title || 'chạm để mở'}
          </p>
        </div>
      )}

      {/* Gold header bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:32, zIndex:12, pointerEvents:'none',
        background:'linear-gradient(180deg,#1a1000 0%,#c9a453 40%,#e8c878 50%,#c9a453 60%,#1a1000 100%)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <span style={{ fontSize:8, letterSpacing:5, color:'#1a1000', fontWeight:800, textTransform:'uppercase', fontFamily:FS }}>
          TAPORY
        </span>
      </div>

      <Skip onClick={trigger} />
    </div>
  );
}
