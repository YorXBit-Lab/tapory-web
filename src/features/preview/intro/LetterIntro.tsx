'use client';

import { useState, useEffect, useCallback } from 'react';
import { FD, FS, EXPO, SPR, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function LetterIntro({ onComplete, title }: BaseProps) {
  type Ph = 'arriving' | 'idle' | 'opening' | 'revealing';
  const [ph, setPh] = useState<Ph>('arriving');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  useEffect(() => {
    const t = setTimeout(() => setPh('idle'), 720);
    return () => clearTimeout(t);
  }, []);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('opening');
    // Letter rises at 580 ms — flap has passed 90° and back-face is hidden by then
    setTimeout(() => setPh('revealing'), 580);
    setTimeout(() => trigger(), 2300);
  }, [ph, fading, trigger]);

  return (
    <div onClick={tap} style={{
      ...WRAP, cursor: ph === 'idle' ? 'pointer' : 'default',
      background: 'radial-gradient(ellipse at 50% 38%, #1c1508 0%, #0d0a06 55%, #07060a 100%)',
      ...fs,
    }}>
      {/* Ambient warm glow */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 50% 32%, rgba(201,164,83,0.07) 0%, transparent 58%)' }} />

      {/* Envelope */}
      <div style={{
        position:'relative', width:264, height:170,
        animation: ph === 'arriving' ? `_ltr_arrive 700ms ${EXPO} forwards` : 'none',
        opacity: ph === 'arriving' ? 0 : 1,
      }}>
        {/* Deep shadow stack */}
        <div style={{ position:'absolute', inset:0, transform:'translateY(16px) scale(.96)', borderRadius:8, background:'rgba(0,0,0,0.7)', filter:'blur(20px)' }} />
        <div style={{ position:'absolute', inset:0, transform:'translateY(6px) scale(.99)', borderRadius:8, background:'rgba(201,164,83,0.06)', filter:'blur(8px)' }} />

        {/* Envelope body — cream paper */}
        <div style={{
          position:'absolute', inset:0, borderRadius:8,
          background:'linear-gradient(165deg, #f5ede0 0%, #eee0c6 50%, #e6d2b0 100%)',
          border:'1px solid rgba(155,115,55,0.3)',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(0,0,0,0.07)',
          overflow:'hidden',
        }}>
          {/* Subtle paper grain */}
          <div style={{ position:'absolute', inset:0, opacity:.035,
            backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }} />
          {/* Inside fold lines — two diagonal crease lines from bottom corners meeting at centre-bottom */}
          <svg width="264" height="170" style={{ position:'absolute', inset:0 }}>
            {/* Bottom flap triangle (the lower panel that folds inward) */}
            <path d="M0 170 L132 105 L264 170" fill="rgba(120,82,25,0.07)" />
            {/* Left & right side crease lines */}
            <line x1="0"   y1="170" x2="132" y2="105" stroke="rgba(120,82,25,0.12)" strokeWidth=".75" />
            <line x1="264" y1="170" x2="132" y2="105" stroke="rgba(120,82,25,0.12)" strokeWidth=".75" />
            {/* Left side panel fold */}
            <line x1="0"   y1="0"   x2="0"   y2="170" stroke="rgba(120,82,25,0.06)" strokeWidth=".5" />
            <line x1="264" y1="0"   x2="264" y2="170" stroke="rgba(120,82,25,0.06)" strokeWidth=".5" />
          </svg>
          {/* Gold foil edges */}
          <div style={{ position:'absolute', inset:0, border:'1px solid rgba(201,164,83,0.18)', borderRadius:7, pointerEvents:'none' }} />
          <div style={{ position:'absolute', inset:6, border:'0.5px solid rgba(201,164,83,0.1)', borderRadius:4, pointerEvents:'none' }} />
        </div>

        {/* Wax seal — zIndex:9 so it sits visibly ON TOP of the closed flap (zIndex:7) */}
        <div style={{
          position:'absolute', top:44, left:'50%',
          transform:'translateX(-50%)',           /* centred baseline for _pulse */
          width:48, height:48, zIndex:9,
          animation: ph === 'idle' ? '_pulse 3s ease-in-out infinite'
            : (ph === 'opening' || ph === 'revealing') ? `_ltr_seal 280ms ${EXPO} forwards` : 'none',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <defs>
              <radialGradient id="seal" cx="36%" cy="28%">
                <stop offset="0%" stopColor="#d44040" />
                <stop offset="55%" stopColor="#aa1414" />
                <stop offset="100%" stopColor="#780808" />
              </radialGradient>
            </defs>
            <circle cx="24" cy="24" r="22" fill="url(#seal)" />
            <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,220,215,0.25)" strokeWidth=".75" />
            <text x="24" y="29" textAnchor="middle" fontSize="14" fill="rgba(255,240,235,0.82)"
              fontWeight="700" fontFamily={FD} letterSpacing="0.5">T</text>
          </svg>
        </div>

        {/* Flap — hinge at top-center; backface hidden so its reverse never shows */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:96, zIndex:7,
          transformOrigin:'center top',
          backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
          animation:(ph==='opening'||ph==='revealing') ? `_ltr_flap 1.1s ${SPR} forwards` : 'none',
        }}>
          <svg width="266" height="96" style={{ display:'block' }}>
            <defs>
              <linearGradient id="flapF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eee2cc" />
                <stop offset="100%" stopColor="#d8c4a4" />
              </linearGradient>
              {/* Subtle inner shadow along the fold edge */}
              <linearGradient id="flapEdge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(60,30,0,0.12)" />
              </linearGradient>
            </defs>
            {/* Main flap face */}
            <path d="M0 0 L133 88 L266 0 Z" fill="url(#flapF)" />
            {/* Fold-edge shadow gradient overlay */}
            <path d="M0 0 L133 88 L266 0 Z" fill="url(#flapEdge)" />
            {/* Perimeter stroke for paper edge definition */}
            <path d="M1 1 L133 87 L265 1" fill="none" stroke="rgba(140,100,40,0.2)" strokeWidth=".6" />
          </svg>
        </div>

        {/* Inner letter card — zIndex:8 above flap (7) so it rises clear of it */}
        {(ph === 'revealing') && (
          <div style={{
            position:'absolute', left:16, right:16, top:20, bottom:16, zIndex:8,
            background:'linear-gradient(160deg, #fdfaf5 0%, #f8f2e8 100%)',
            borderRadius:4,
            boxShadow:'0 -10px 36px rgba(0,0,0,0.24), 0 -2px 8px rgba(0,0,0,0.1)',
            border:'0.5px solid rgba(175,135,70,0.22)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:'12px 18px', gap:5,
            animation:`_ltr_letter 800ms ${SPR} forwards`,
          }}>
            <div style={{ width:'68%', display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
              <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,transparent,#c9a453)' }} />
              <span style={{ fontSize:6, color:'#c9a453', letterSpacing:2 }}>✦</span>
              <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,#c9a453,transparent)' }} />
            </div>
            <p style={{ margin:'3px 0 1px', fontSize:14, fontWeight:400, color:'#38220e',
              textAlign:'center', fontFamily:FD, fontStyle:'italic', letterSpacing:'.015em', lineHeight:1.5 }}>
              {title || 'Dành cho bạn'}
            </p>
            <p style={{ margin:0, fontSize:8, color:'#9a7850', letterSpacing:'.18em',
              textTransform:'uppercase', fontFamily:FS, opacity:.75 }}>
              với tất cả yêu thương
            </p>
            <div style={{ width:'68%', display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
              <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,transparent,#c9a453)' }} />
              <span style={{ fontSize:6, color:'#c9a453', letterSpacing:2 }}>✦</span>
              <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,#c9a453,transparent)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Prompt */}
      {ph === 'idle' && (
        <div style={{ marginTop:44, textAlign:'center', animation:'_hint 2.6s ease-in-out infinite' }}>
          <p style={{ margin:0, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
            color:'rgba(255,255,255,0.25)', fontFamily:FS }}>chạm để mở</p>
          <div style={{ width:1, height:14, background:'rgba(255,255,255,0.12)', margin:'8px auto 0' }} />
        </div>
      )}
      <Skip onClick={trigger} />
    </div>
  );
}
