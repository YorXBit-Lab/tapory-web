'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FS, WRAP, type BaseProps } from './shared';

export function ScratchIntro({ onComplete, primaryColor }: BaseProps) {
  const cvRef   = useRef<HTMLCanvasElement>(null);
  const isDown  = useRef(false);
  const lastP   = useRef<{x:number;y:number}|null>(null);
  const checkT  = useRef<number>(0);
  const completing = useRef(false);

  const [pct,   setPct]   = useState(0);
  const [hint,  setHint]  = useState(true);
  const [done,  setDone]  = useState(false);

  const stars = useMemo(() => [...Array(18)].map((_, i) => ({
    left:`${(i*53+3)%96}%`, top:`${(i*67+7)%92}%`,
    size:4+Math.random()*5, delay:Math.random()*3200, dur:1.6+Math.random()*2,
  })), []);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;
    const ctx = cv.getContext('2d', { willReadFrequently:true }); if (!ctx) return;

    // ── Wood-paper base gradient (horizontal warm grain light) ──
    const g = ctx.createLinearGradient(0, 0, cv.width, 0);
    g.addColorStop(0,   '#b8844a');
    g.addColorStop(.18, '#cfa060');
    g.addColorStop(.35, '#b87840');
    g.addColorStop(.52, '#d4aa72');
    g.addColorStop(.68, '#c09050');
    g.addColorStop(.82, '#d0a868');
    g.addColorStop(1,   '#b88048');
    ctx.fillStyle = g; ctx.fillRect(0,0,cv.width,cv.height);

    // Depth variation — vertical gradient overlay
    const gv = ctx.createLinearGradient(0, 0, 0, cv.height);
    gv.addColorStop(0,   'rgba(255,200,120,.1)');
    gv.addColorStop(.45, 'rgba(255,200,120,.18)');
    gv.addColorStop(1,   'rgba(80,30,0,.12)');
    ctx.fillStyle = gv; ctx.fillRect(0,0,cv.width,cv.height);

    // ── Wood grain lines ──
    for (let y = 0; y < cv.height; y += 2.8) {
      const wave1 = Math.sin(y * 0.055) * 5;
      const wave2 = Math.sin(y * 0.22 + 1.4) * 1.8;
      const alpha = 0.03 + Math.random() * 0.055;
      ctx.strokeStyle = `rgba(65,25,5,${alpha})`;
      ctx.lineWidth   = 0.4 + Math.random() * 0.7;
      ctx.beginPath();
      ctx.moveTo(wave1 + wave2, y);
      // gentle bezier wave across width
      ctx.bezierCurveTo(
        cv.width * 0.28 + wave1, y + (Math.random() - .5) * 1.2,
        cv.width * 0.68 + wave2, y + (Math.random() - .5) * 1.2,
        cv.width + wave1 + wave2, y
      );
      ctx.stroke();
    }

    // ── Warm highlight shimmer band ──
    const sh = ctx.createLinearGradient(0, 0, cv.width, 0);
    sh.addColorStop(0,   'rgba(255,230,160,0)');
    sh.addColorStop(.35, 'rgba(255,230,160,.08)');
    sh.addColorStop(.5,  'rgba(255,230,160,.22)');
    sh.addColorStop(.65, 'rgba(255,230,160,.08)');
    sh.addColorStop(1,   'rgba(255,230,160,0)');
    ctx.fillStyle = sh; ctx.fillRect(0,0,cv.width,cv.height);

    // ── Vignette edges ──
    const vg = ctx.createRadialGradient(cv.width/2, cv.height/2, cv.width*.3, cv.width/2, cv.height/2, cv.width*.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(50,18,2,.28)');
    ctx.fillStyle = vg; ctx.fillRect(0,0,cv.width,cv.height);

    // ── Centre text ──
    const cx = cv.width/2, cy = cv.height/2;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(40,12,0,.4)'; ctx.shadowBlur = 6;
    ctx.fillStyle = 'rgba(45,18,4,.52)';
    ctx.font = `600 ${Math.min(24,cv.width*.062)}px ${FS}`;
    ctx.fillText('CÀO ĐỂ KHÁM PHÁ', cx, cy - 20);
    ctx.shadowBlur = 0;
    ctx.font = `${Math.min(38,cv.width*.095)}px serif`;
    ctx.fillStyle = 'rgba(45,18,4,.38)';
    ctx.fillText('✦', cx, cy + 20);
    ctx.font = `${Math.min(11,cv.width*.028)}px ${FS}`;
    ctx.fillStyle = 'rgba(45,18,4,.3)';
    ctx.fillText('Vuốt ngón tay để cào', cx, cy + 54);
  }, []);

  const getPos = useCallback((e: React.MouseEvent|React.TouchEvent) => {
    const cv=cvRef.current; if(!cv) return null;
    const r=cv.getBoundingClientRect();
    const sx=cv.width/r.width, sy=cv.height/r.height;
    if ('touches' in e) {
      const t=e.touches[0];
      return {x:(t.clientX-r.left)*sx, y:(t.clientY-r.top)*sy};
    }
    return {x:(e.clientX-r.left)*sx, y:(e.clientY-r.top)*sy};
  }, []);

  const scratchAt = useCallback((x:number, y:number) => {
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext('2d',{willReadFrequently:true}); if(!ctx) return;
    ctx.globalCompositeOperation='destination-out';
    const g=ctx.createRadialGradient(x,y,0,x,y,32);
    g.addColorStop(0,'rgba(0,0,0,1)');
    g.addColorStop(.65,'rgba(0,0,0,.88)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(x,y,32,0,Math.PI*2); ctx.fill();
    if(lastP.current){
      ctx.lineWidth=46; ctx.lineCap='round';
      ctx.strokeStyle='rgba(0,0,0,.88)';
      ctx.beginPath(); ctx.moveTo(lastP.current.x,lastP.current.y); ctx.lineTo(x,y); ctx.stroke();
    }
    lastP.current={x,y};
    ctx.globalCompositeOperation='source-over';
    setHint(false);

    clearTimeout(checkT.current);
    checkT.current=window.setTimeout(()=>{
      const d=ctx.getImageData(0,0,cv.width,cv.height);
      let t=0; const tot=Math.floor(d.data.length/(4*16));
      for(let i=3;i<d.data.length;i+=64) if(d.data[i]<64) t++;
      const p=Math.min(100,(t/tot)*100);
      setPct(p);
      if(p>50 && !completing.current){
        completing.current=true;
        const c2=cv.getContext('2d');
        if(c2){
          let a=1;
          const anim=()=>{
            a-=.045; c2.globalAlpha=Math.max(0,a);
            c2.clearRect(0,0,cv.width,cv.height);
            if(a>0.02) requestAnimationFrame(anim);
            else { setDone(true); setTimeout(onComplete,320); }
          };
          setTimeout(anim,60);
        }
      }
    },100);
  },[onComplete]);

  return (
    <div style={{ ...WRAP, background:'transparent' }}>
      {/* Warm gold glint sparks — embedded in the wood coating */}
      {stars.map((s,i) => (
        <div key={i} style={{
          position:'fixed', left:s.left, top:s.top,
          width:s.size, height:s.size,
          clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
          background:'rgba(240,185,70,.72)',
          filter:`drop-shadow(0 0 ${s.size*.6}px rgba(220,160,40,.5))`,
          animation:`_scr_star ${s.dur}s ${s.delay}ms ease-in-out infinite`,
          zIndex:9999, pointerEvents:'none',
        }} />
      ))}

      {/* Progress bar */}
      {pct>0 && (
        <div style={{ position:'fixed',top:0,left:0,right:0,height:3,zIndex:10002 }}>
          <div style={{
            height:'100%', width:`${pct}%`, borderRadius:'0 2px 2px 0',
            background:'linear-gradient(90deg,#c8903a,#e8c060,#d4a040)',
            transition:'width .1s', boxShadow:'0 0 8px rgba(210,160,50,.55)',
          }} />
        </div>
      )}

      {/* Canvas */}
      <canvas ref={cvRef} style={{
        position:'fixed', inset:0, zIndex:10000,
        cursor:'crosshair', touchAction:'none',
        opacity:done?0:1, transition:done?'opacity .4s':'none',
      }}
        onMouseDown={e=>{isDown.current=true;lastP.current=null;const p=getPos(e);if(p)scratchAt(p.x,p.y);}}
        onMouseMove={e=>{if(isDown.current){const p=getPos(e);if(p)scratchAt(p.x,p.y);}}}
        onMouseUp={()=>{isDown.current=false;lastP.current=null;}}
        onMouseLeave={()=>{isDown.current=false;lastP.current=null;}}
        onTouchStart={e=>{e.preventDefault();isDown.current=true;lastP.current=null;const p=getPos(e);if(p)scratchAt(p.x,p.y);}}
        onTouchMove={e=>{e.preventDefault();const p=getPos(e);if(p&&isDown.current)scratchAt(p.x,p.y);}}
        onTouchEnd={()=>{isDown.current=false;lastP.current=null;}}
      />

      {hint && (
        <div style={{ position:'fixed',bottom:52,left:0,right:0,zIndex:10002,textAlign:'center',pointerEvents:'none' }}>
          <div style={{
            display:'inline-flex',alignItems:'center',gap:7,
            background:'rgba(0,0,0,.58)',backdropFilter:'blur(10px)',
            borderRadius:20,padding:'8px 18px',
            border:'1px solid rgba(255,255,255,.1)',
            animation:'_hint 2.4s ease-in-out infinite',
          }}>
            <p style={{ margin:0,fontSize:11,letterSpacing:'.12em',color:'#f0d060',fontWeight:500,fontFamily:FS }}>
              Vuốt để cào lộ nội dung
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
