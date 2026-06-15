'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FD, FS, EXPO, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function UniverseIntro({ onComplete, primaryColor, accentColor, title, imageUrl }: BaseProps) {
  type Ph = 'void' | 'emerging' | 'drifting' | 'converging' | 'blooming';
  const [ph, setPh]  = useState<Ph>('void');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const stRef  = useRef<{ ph: Ph; t0emerge: number; t0conv: number; t0bloom: number }>(
    { ph: 'void', t0emerge: 0, t0conv: 0, t0bloom: 0 },
  );
  const rafRef = useRef<number>(0);

  const tap = useCallback(() => {
    if (stRef.current.ph !== 'drifting' || fading) return;
    stRef.current.ph     = 'converging';
    stRef.current.t0conv = performance.now();
    setPh('converging');
    setTimeout(() => {
      stRef.current.ph      = 'blooming';
      stRef.current.t0bloom = performance.now();
      setPh('blooming');
    }, 1950);
    setTimeout(() => trigger(), 4700);
  }, [fading, trigger]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W  = cv.width  = window.innerWidth;
    const H  = cv.height = window.innerHeight;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const cx = W / 2, cy = H / 2;
    const R  = (a: number, b: number) => a + Math.random() * (b - a); // range helper

    /* ── Phase auto-sequence ── */
    const tE = setTimeout(() => {
      stRef.current.t0emerge = performance.now();
      stRef.current.ph       = 'emerging';
      setPh('emerging');
    }, 750);
    const tD = setTimeout(() => {
      if (stRef.current.ph === 'void' || stRef.current.ph === 'emerging') {
        stRef.current.ph = 'drifting';
        setPh('drifting');
      }
    }, 5200);

    /* ── Colors ── */
    const hex2rgb = (h: string): [number,number,number] => {
      const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h ?? '');
      return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : [99,102,241];
    };
    const K = (v: number) => Math.round(Math.max(0, Math.min(255, v)));
    const [pr, pg, pb] = hex2rgb(primaryColor ?? '#6366f1');
    const [ar, ag, ab] = hex2rgb(accentColor  ?? '#a5b4fc');

    /* ── Stars ── */
    interface Star {
      bx:number; by:number; vx:number; vy:number;
      r:number; baseA:number; tAmp:number; tSpd:number; tPh:number;
      cr:number; cg:number; cb:number; layer:number;
      birth:number; fadeD:number;  // fade-in timing (ms from canvas start)
    }
    const stars: Star[] = [];

    /* Galaxy spiral arms — 2 × 80 = 160 */
    for (let i = 0; i < 160; i++) {
      const arm  = i & 1;
      const frac = (i >> 1) / 80;
      const t    = frac * Math.PI * 3.6 + arm * Math.PI;
      const dist = 18 + frac * Math.max(W, H) * 0.46;
      const sc   = R(-1, 1) * dist * 0.30; const jt = R(-9, 9);
      stars.push({
        bx: Math.cos(t) * (dist + sc) + jt, by: Math.sin(t) * (dist + sc) * 0.58 + jt * 0.5,
        vx: R(-0.036, 0.036), vy: R(-0.022, 0.022),
        r: R(0.7, 2.3), baseA: R(0.35, 0.88), tAmp: R(0.18, 0.60), tSpd: R(0.5, 2.1), tPh: R(0, Math.PI*2),
        cr: K(200+R(0,55)), cg: K(215+R(0,40)), cb: 255, layer: 1,
        birth: R(1100, 4600), fadeD: R(600, 1200),
      });
    }
    /* Bright foreground — 90 */
    for (let i = 0; i < 90; i++) {
      const a = Math.random()*Math.PI*2; const d = R(20, Math.max(W,H)*0.62);
      stars.push({
        bx: Math.cos(a)*d, by: Math.sin(a)*d*0.80,
        vx: R(-0.058, 0.058), vy: R(-0.036, 0.036),
        r: R(1.4, 3.3), baseA: R(0.50, 0.98), tAmp: R(0.28, 0.55), tSpd: R(0.6, 2.5), tPh: R(0,Math.PI*2),
        cr: K(pr+70+R(0,85)), cg: K(pg+55+R(0,85)), cb: K(pb+30+R(0,75)), layer: 2,
        birth: R(1400, 5000), fadeD: R(700, 1300),
      });
    }
    /* Mid stars — 195 */
    for (let i = 0; i < 195; i++) {
      const a = Math.random()*Math.PI*2; const d = Math.random()*Math.max(W,H)*0.74;
      stars.push({
        bx: Math.cos(a)*d, by: Math.sin(a)*d*0.86,
        vx: R(-0.022, 0.022), vy: R(-0.014, 0.014),
        r: R(0.38, 1.0), baseA: R(0.15, 0.42), tAmp: R(0.08, 0.22), tSpd: R(0.3, 1.2), tPh: R(0,Math.PI*2),
        cr: K(185+R(0,70)), cg: K(192+R(0,63)), cb: K(210+R(0,45)), layer: 1,
        birth: R(600, 4000), fadeD: R(500, 1000),
      });
    }
    /* Deep background — 210 */
    for (let i = 0; i < 210; i++) {
      stars.push({
        bx: R(-1,1)*W*1.55, by: R(-1,1)*H*1.55,
        vx: R(-0.007, 0.007), vy: R(-0.004, 0.004),
        r: R(0.15, 0.55), baseA: R(0.04, 0.15), tAmp: R(0.02, 0.06), tSpd: R(0.08, 0.5), tPh: R(0,Math.PI*2),
        cr: K(175+R(0,80)), cg: K(188+R(0,67)), cb: K(212+R(0,43)), layer: 0,
        birth: R(300, 3800), fadeD: R(400, 1000),
      });
    }

    /* ── Shooting stars ── */
    interface Shoot { x:number;y:number;dx:number;dy:number;len:number;alpha:number;life:number;maxLife:number; }
    const shoots: Shoot[] = [];
    let shootTimer = R(1800, 3200);
    const spawnShoot = () => {
      const ang = R(-0.55, -0.10); const spd = R(7, 15);
      shoots.push({ x: R(0.03, 0.58)*W, y: R(0, 0.52)*H,
        dx: Math.cos(ang)*spd, dy: Math.sin(ang)*spd + R(1, 3),
        len: R(60, 135), alpha: R(0.65, 1), life: 0, maxLife: R(28, 52) });
    };

    /* ── Nebulae ── */
    const nebulae = [
      { x:W*0.12, y:H*0.17, rx:W*0.30, ry:H*0.18, r:pr,          g:pg,          b:pb,           a:0.062 },
      { x:W*0.82, y:H*0.11, rx:W*0.24, ry:H*0.15, r:ar,          g:ag,          b:ab,           a:0.050 },
      { x:W*0.06, y:H*0.66, rx:W*0.26, ry:H*0.16, r:K(pr+25),    g:K(pg+15),    b:K(pb+85),     a:0.055 },
      { x:W*0.87, y:H*0.72, rx:W*0.28, ry:H*0.18, r:K(ar-15),    g:K(ag+50),    b:K(ab+8),      a:0.060 },
      { x:W*0.50, y:H*0.50, rx:W*0.38, ry:H*0.26, r:pr,          g:pg,          b:pb,           a:0.032 },
      { x:W*0.30, y:H*0.78, rx:W*0.20, ry:H*0.14, r:K(pr-20),    g:K(pg+38),    b:K(pb+65),     a:0.042 },
      { x:W*0.68, y:H*0.32, rx:W*0.18, ry:H*0.12, r:K(ar+10),    g:K(ag-10),    b:K(ab+30),     a:0.038 },
    ];

    /* ── Milky Way cluster blobs ── */
    const mwBlobs = Array.from({ length: 200 }, (_, i) => {
      const t = i / 200;
      return { x: R(-0.08, 0.08)*W + t*W, y: R(-0.06, 0.06)*H + t*H*0.52 + H*0.14, r: R(1, 6), a: R(0.003, 0.016) };
    });

    /* ── God ray angles (converging) ── */
    const rays = Array.from({ length: 14 }, () => ({ angle: R(0, Math.PI*2), width: R(5, 16), alpha: R(0.10, 0.25) }));

    /* ── Dust motes ── */
    const motes = Array.from({ length: 78 }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: R(0.28, 0.88), a: R(0.018, 0.068), vx: R(-0.09, 0.09), vy: R(-0.075, -0.018),
    }));

    /* ── Core micro-stars (center cluster) ── */
    const coreStars = Array.from({ length: 36 }, (_, i) => {
      const ang = (i/36)*Math.PI*2; const d = R(3, 28);
      return { x: cx+Math.cos(ang)*d, y: cy+Math.sin(ang)*d*0.65, r: R(0.3, 1.8), a: R(0.20, 0.58), ph: R(0,Math.PI*2) };
    });

    /* ── Camera drift coefficients ── */
    const CAM = { ax:22, ay:14, f1:0.000096, f2:0.000138, f3:0.000110, f4:0.000083, zAmp:0.016, zF:0.000064 };

    let prevNow = performance.now();
    let t0: number | null = null;
    let mounted = true;

    const draw = (now: number) => {
      if (!mounted) return;
      if (t0 === null) t0 = now;
      const ms  = now - t0;
      const dt  = Math.min(now - prevNow, 50); prevNow = now;
      const { ph: curPh, t0emerge, t0conv, t0bloom } = stRef.current;

      /* Emergence progress (0→1 over 4.5s from first star appearing) */
      const emergeT  = t0emerge > 0 ? Math.min(1, (now - t0emerge) / 4200) : 0;
      /* Convergence ease-in³: slow start → dramatic rush */
      const convRaw  = curPh === 'converging' ? Math.min(1, (now - t0conv) / 1900)
                     : curPh === 'blooming'   ? 1 : 0;
      const convE    = convRaw * convRaw * convRaw;
      /* Bloom dark-overlay alpha */
      const blA      = curPh === 'blooming' ? Math.min(0.93, (now - t0bloom) / 700) : 0;
      /* Cinematic camera drift (fades out during convergence) */
      const camMult  = curPh === 'converging' ? Math.max(0, 1 - convE * 2.4)
                     : curPh === 'blooming'   ? 0 : 1;
      const camX     = (CAM.ax*Math.sin(ms*CAM.f1) + CAM.ax*0.38*Math.cos(ms*CAM.f2)) * camMult;
      const camY     = (CAM.ay*Math.cos(ms*CAM.f3) + CAM.ay*0.28*Math.sin(ms*CAM.f4)) * camMult;
      const camZ     = 1 + CAM.zAmp*Math.sin(ms*CAM.zF);

      ctx.clearRect(0, 0, W, H);

      /* ── Deep space background ── */
      const bg = ctx.createRadialGradient(cx, cy*0.88, 0, cx, cy, Math.max(W,H)*0.92);
      bg.addColorStop(0,    `rgba(${pr>>1},${pg>>1},${pb>>1},0.18)`);
      bg.addColorStop(0.18, 'rgba(4,2,10,1)');
      bg.addColorStop(0.52, 'rgba(2,1,7,1)');
      bg.addColorStop(1,    'rgba(1,0,4,1)');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      /* ── Milky Way band ── */
      const mwVis = Math.min(1, emergeT * 1.6);
      if (mwVis > 0) {
        for (const b of mwBlobs) {
          ctx.beginPath(); ctx.arc(b.x + camX*0.08, b.y + camY*0.08, b.r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${ar},${ag},${ab},${(b.a * mwVis).toFixed(4)})`; ctx.fill();
        }
        const mwG = ctx.createLinearGradient(0, H*0.08, W, H*0.92);
        mwG.addColorStop(0,    'rgba(255,255,255,0)');
        mwG.addColorStop(0.30, `rgba(${pr},${pg},${pb},${(0.022*mwVis).toFixed(4)})`);
        mwG.addColorStop(0.50, `rgba(${ar},${ag},${ab},${(0.034*mwVis).toFixed(4)})`);
        mwG.addColorStop(0.70, `rgba(${pr},${pg},${pb},${(0.020*mwVis).toFixed(4)})`);
        mwG.addColorStop(1,    'rgba(255,255,255,0)');
        ctx.fillStyle = mwG; ctx.fillRect(0, 0, W, H);
      }

      /* ── Nebulae ── */
      const nebVis = Math.min(1, emergeT * 2.0);
      for (const n of nebulae) {
        const pulse = 1 + 0.028 * Math.sin(ms*0.000422 + n.x*0.011);
        ctx.save();
        ctx.translate(n.x + camX*0.14, n.y + camY*0.14);
        ctx.scale(pulse, pulse*0.76);
        const ng = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx);
        ng.addColorStop(0,    `rgba(${n.r},${n.g},${n.b},${(n.a*3.5*nebVis).toFixed(3)})`);
        ng.addColorStop(0.28, `rgba(${n.r},${n.g},${n.b},${(n.a*nebVis).toFixed(3)})`);
        ng.addColorStop(1,    `rgba(${n.r},${n.g},${n.b},0)`);
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.ellipse(0, 0, n.rx, n.ry, Math.PI*0.06, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }

      /* ── Dust motes (drifting only) ── */
      if (curPh === 'drifting') {
        for (const m of motes) {
          m.x += m.vx; m.y += m.vy;
          if (m.x<0) m.x=W; else if (m.x>W) m.x=0;
          if (m.y<0) m.y=H;
          ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${pr},${pg},${pb},${m.a.toFixed(3)})`; ctx.fill();
        }
      }

      /* ── Stars ── */
      if (curPh !== 'blooming') {
        for (const s of stars) {
          s.bx += s.vx; s.by += s.vy;
          const bnd = Math.max(W,H)*0.86;
          if (s.bx<-bnd) s.bx=bnd; else if (s.bx>bnd) s.bx=-bnd;
          if (s.by<-bnd) s.by=bnd; else if (s.by>bnd) s.by=-bnd;

          /* Fade-in from birth */
          const age    = ms - s.birth;
          const fadeIn = age < 0 ? 0 : Math.min(1, age / s.fadeD);
          if (fadeIn < 0.005) continue;

          const twink = 1 - s.tAmp + s.tAmp * Math.sin(ms*0.001*s.tSpd + s.tPh);
          const alpha = s.baseA * twink * fadeIn * Math.max(0, 1 - convE*1.22);
          if (alpha < 0.007) continue;

          /* Camera + convergence lerp */
          const lerpF = convE;
          const x = cx + (s.bx*(1-lerpF) + camX) * camZ;
          const y = cy + (s.by*(1-lerpF)*0.90 + camY) * camZ;
          const r = Math.max(0.1, s.r*(1-lerpF*0.92));

          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${s.cr},${s.cg},${s.cb},${alpha.toFixed(3)})`; ctx.fill();

          /* 4-point sparkle cross on bright foreground stars */
          if (s.layer === 2 && s.r > 1.6 && alpha > 0.22) {
            const span = r*(2.1 + twink*0.8);
            ctx.strokeStyle = `rgba(${s.cr},${s.cg},${s.cb},${(alpha*0.28).toFixed(3)})`;
            ctx.lineWidth   = 0.50;
            ctx.beginPath();
            ctx.moveTo(x-span,y); ctx.lineTo(x+span,y);
            ctx.moveTo(x,y-span); ctx.lineTo(x,y+span);
            ctx.stroke();
          }
        }
      }

      /* ── Core micro-stars (idle/emerging) ── */
      if (curPh === 'drifting' || curPh === 'emerging') {
        const cVis = Math.min(1, emergeT * 2.5);
        for (const s of coreStars) {
          const a = s.a * cVis * (0.48 + 0.52*Math.sin(ms*0.0024 + s.ph));
          ctx.beginPath(); ctx.arc(s.x + camX*0.2, s.y + camY*0.2, s.r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${ar},${ag},${ab},${a.toFixed(3)})`; ctx.fill();
        }
      }

      /* ── Shooting stars ── */
      if (curPh === 'drifting') {
        shootTimer -= dt;
        if (shootTimer <= 0) { spawnShoot(); shootTimer = R(1500, 2900); }
        for (let i = shoots.length-1; i >= 0; i--) {
          const sh = shoots[i];
          sh.x += sh.dx; sh.y += sh.dy; sh.life++;
          if (sh.life > sh.maxLife) { shoots.splice(i,1); continue; }
          const prog = sh.life / sh.maxLife;
          const sa   = sh.alpha * (1-prog);
          const mag  = Math.hypot(sh.dx, sh.dy);
          const tx   = sh.x - (sh.dx/mag)*sh.len;
          const ty   = sh.y - (sh.dy/mag)*sh.len;
          const grd  = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
          grd.addColorStop(0,    `rgba(255,255,255,${sa.toFixed(3)})`);
          grd.addColorStop(0.20, `rgba(${ar},${ag},${ab},${(sa*0.55).toFixed(3)})`);
          grd.addColorStop(1,    `rgba(${pr},${pg},${pb},0)`);
          ctx.strokeStyle = grd; ctx.lineWidth = Math.max(0.3, 1.5-prog); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(sh.x,sh.y); ctx.lineTo(tx,ty); ctx.stroke();
        }
      }

      /* ── God rays — volumetric light during convergence ── */
      if (curPh === 'converging' && convE > 0.04) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const rA = Math.min(1, (convE-0.04) * 1.8);
        for (const ray of rays) {
          const a = ray.alpha * rA;
          if (a < 0.005) continue;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(ray.angle + ms*0.000032);
          const len = Math.max(W, H) * 1.5;
          const grd = ctx.createLinearGradient(0, 0, 0, -len);
          grd.addColorStop(0,    `rgba(${pr},${pg},${pb},${a.toFixed(3)})`);
          grd.addColorStop(0.30, `rgba(${pr},${pg},${pb},${(a*0.38).toFixed(3)})`);
          grd.addColorStop(1,    `rgba(${pr},${pg},${pb},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.moveTo(-ray.width, 0);
          ctx.lineTo(-ray.width*0.08, -len);
          ctx.lineTo(ray.width*0.08, -len);
          ctx.lineTo(ray.width, 0);
          ctx.fill();
          ctx.restore();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      }

      /* ── Convergence energy bloom ── */
      if (curPh === 'converging') {
        const bloomR = 4 + convE*Math.max(W,H)*0.72;
        const bInt   = Math.min(0.96, convE*2.1);
        const bl = ctx.createRadialGradient(cx,cy,0, cx,cy,bloomR);
        bl.addColorStop(0,    `rgba(255,255,255,${Math.min(1,convE*3.2).toFixed(3)})`);
        bl.addColorStop(0.04, `rgba(${pr},${pg},${pb},${bInt.toFixed(3)})`);
        bl.addColorStop(0.24, `rgba(${pr},${pg},${pb},${(bInt*0.38).toFixed(3)})`);
        bl.addColorStop(0.56, `rgba(${pr},${pg},${pb},${(bInt*0.08).toFixed(3)})`);
        bl.addColorStop(1,    `rgba(${pr},${pg},${pb},0)`);
        ctx.fillStyle = bl;
        ctx.beginPath(); ctx.arc(cx,cy,bloomR,0,Math.PI*2); ctx.fill();
        if (convE > 0.25) {
          const rR = bloomR*0.34;
          const rg = ctx.createRadialGradient(cx,cy,0, cx,cy,rR);
          rg.addColorStop(0, `rgba(${ar},${ag},${ab},${((convE-0.25)*0.62*1.4).toFixed(3)})`);
          rg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.arc(cx,cy,rR,0,Math.PI*2); ctx.fill();
        }
      }

      /* ── Blooming: fade to darkness + residual glow ── */
      if (curPh === 'blooming') {
        ctx.fillStyle = `rgba(1,0,4,${blA.toFixed(3)})`; ctx.fillRect(0,0,W,H);
        const halo = ctx.createRadialGradient(cx,cy,0, cx,cy,Math.max(W,H)*0.58);
        halo.addColorStop(0,    `rgba(${pr},${pg},${pb},${(0.15*(1-blA)).toFixed(3)})`);
        halo.addColorStop(0.36, `rgba(${pr},${pg},${pb},${(0.04*(1-blA)).toFixed(3)})`);
        halo.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.fillStyle = halo; ctx.fillRect(0,0,W,H);
      }

      /* ── Void: black overlay that fades out at start ── */
      const voidA = Math.max(0, 1 - ms / 2200);
      if (voidA > 0) { ctx.fillStyle = `rgba(0,0,0,${voidA.toFixed(3)})`; ctx.fillRect(0,0,W,H); }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(tE);
      clearTimeout(tD);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onClick={tap}
      style={{ ...WRAP, cursor: ph === 'drifting' ? 'pointer' : 'default', background:'#000000', ...fs }}
    >
      {/* ── Cinematic galaxy canvas ── */}
      <canvas ref={cvRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />

      {/* ── Convergence energy ring ── */}
      {ph === 'converging' && (
        <div style={{
          position:'absolute', left:'50%', top:'50%', marginLeft:-135, marginTop:-135,
          width:270, height:270, borderRadius:'50%', zIndex:2, pointerEvents:'none',
          border:`1.5px solid ${primaryColor}50`,
          animation:`_gal_ring 1.95s ${EXPO} forwards`,
        }} />
      )}

      {/* ── Cinematic bloom reveal ── */}
      {ph === 'blooming' && (<>
        {/* Three expanding corona rings at staggered sizes */}
        <div style={{ position:'absolute', left:'50%', top:'50%', marginLeft:-165, marginTop:-165,
          width:330, height:330, borderRadius:'50%', border:`1px solid ${primaryColor}25`,
          zIndex:2, pointerEvents:'none', animation:`_gal_corona 2.7s ${EXPO} both` }} />
        <div style={{ position:'absolute', left:'50%', top:'50%', marginLeft:-115, marginTop:-115,
          width:230, height:230, borderRadius:'50%', border:`1px solid ${primaryColor}45`,
          zIndex:2, pointerEvents:'none', animation:`_gal_corona 2.15s .14s ${EXPO} both` }} />
        <div style={{ position:'absolute', left:'50%', top:'50%', marginLeft:-76, marginTop:-76,
          width:152, height:152, borderRadius:'50%', border:`1px solid ${primaryColor}65`,
          zIndex:2, pointerEvents:'none', animation:`_gal_corona 1.80s .26s ${EXPO} both` }} />

        {/* Memory content */}
        <div style={{ position:'relative', zIndex:3, display:'flex', flexDirection:'column',
          alignItems:'center', gap:20, padding:'0 32px', textAlign:'center' }}>

          {imageUrl && (
            <div style={{ position:'relative', flexShrink:0 }}>
              {/* Outer ambient glow */}
              <div style={{
                position:'absolute', inset:-18, borderRadius:'50%', pointerEvents:'none',
                background:`radial-gradient(circle,${primaryColor}1e 30%,transparent 72%)`,
                animation:`_float 4s ease-in-out infinite`,
              }} />
              {/* Photo */}
              <div style={{
                width:130, height:130, borderRadius:'50%', overflow:'hidden',
                border:`2.5px solid ${primaryColor}80`,
                boxShadow:`0 0 0 8px ${primaryColor}12,0 0 72px ${primaryColor}68,0 0 160px ${primaryColor}25`,
                animation:`_gal_rise .92s .20s ${EXPO} both`, position:'relative', zIndex:2,
              }}>
                <img
                  src={imageUrl} alt=""
                  style={{ width:'100%', height:'100%', objectFit:'cover',
                    filter:'brightness(1.06) contrast(1.04) saturate(1.10)' }}
                />
              </div>
            </div>
          )}

          <p style={{
            margin:0, fontSize:21, fontFamily:FD, fontWeight:700, color:'#ffffff',
            letterSpacing:'.03em', lineHeight:1.28,
            textShadow:`0 0 52px ${primaryColor},0 0 110px ${primaryColor}50,0 2px 20px rgba(0,0,0,.85)`,
            animation:`_gal_rise .88s .48s ${EXPO} both`,
          }}>
            {title || '🌌 Ký ức vũ trụ'}
          </p>

          <div style={{ display:'flex', alignItems:'center', gap:10, width:'60%',
            animation:`_gal_rise .78s .64s ${EXPO} both` }}>
            <div style={{ flex:1, height:'.5px', background:`linear-gradient(to right,transparent,${primaryColor}58)` }} />
            <span style={{ color:`${primaryColor}88`, fontSize:9, lineHeight:1 }}>✦</span>
            <div style={{ flex:1, height:'.5px', background:`linear-gradient(to left,transparent,${primaryColor}58)` }} />
          </div>

          <p style={{ margin:0, fontSize:9, letterSpacing:'.30em', textTransform:'uppercase',
            color:`${primaryColor}58`, fontFamily:FS,
            animation:`_gal_rise .72s .80s ${EXPO} both` }}>
            chạm để xem
          </p>
        </div>
      </>)}

      {/* ── Tap prompt (only when galaxy is ready) ── */}
      {ph === 'drifting' && (
        <div style={{ position:'absolute', bottom:'18%', left:0, right:0, zIndex:2,
          textAlign:'center', pointerEvents:'none', animation:'_hint 3.4s ease-in-out infinite' }}>
          <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <div style={{ width:1, height:30,
              background:`linear-gradient(to bottom,transparent,${primaryColor}38)` }} />
            <p style={{ margin:0, fontSize:9, letterSpacing:'.30em', textTransform:'uppercase',
              color:`${primaryColor}46`, fontFamily:FS }}>chạm để hội tụ</p>
          </div>
        </div>
      )}

      <Skip onClick={trigger} />
    </div>
  );
}
