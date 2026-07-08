'use client';

import { useState, useEffect } from 'react';
import { FD, FS, EXPO, SPR, WRAP, useFadeOut, type BaseProps } from './shared';

export function TypewriterIntro({ onComplete, primaryColor, title }: BaseProps) {
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [ready, setReady] = useState(false);
  const [showMark, setShowMark] = useState(false);
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  const msg1 = 'Có điều này muốn nói với bạn…';
  const msg2 = title ? `— ${title}` : '— Luôn bên bạn  ♡';

  useEffect(() => {
    // Store ALL timer IDs so cleanup is complete — prevents double-fire in Strict Mode
    const ids: ReturnType<typeof setTimeout>[] = [];
    let j = 0;

    const typeLine2 = () => {
      j++;
      setLine2(msg2.slice(0, j));
      if (j < msg2.length) {
        ids.push(setTimeout(typeLine2, 52 + Math.random() * 42));
      } else {
        ids.push(setTimeout(() => { setShowMark(true); setShowHint(true); setReady(true); }, 600));
      }
    };

    let i = 0;
    const typeLine1 = () => {
      i++;
      setLine1(msg1.slice(0, i));
      if (i < msg1.length) {
        ids.push(setTimeout(typeLine1, 42 + Math.random() * 38));
      } else {
        // Line1 fully typed → wait briefly → start line2
        ids.push(setTimeout(typeLine2, 380));
      }
    };

    ids.push(setTimeout(typeLine1, 500));
    return () => ids.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div onClick={() => { if (ready && !fading) trigger(); }} style={{
      ...WRAP,
      background:'radial-gradient(ellipse at 50% 35%, #f8f0e0 0%, #f2e8d0 55%, #ebe0c4 100%)',
      cursor: ready ? 'pointer' : 'default', ...fs,
    }}>
      {/* Paper grain */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:.025,
        backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.85\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
      {/* Vignette */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at center, transparent 50%, rgba(80,50,15,.18) 100%)' }} />
      {/* Fine border */}
      <div style={{ position:'absolute', inset:20, border:'.5px solid rgba(140,95,30,.2)', borderRadius:2, pointerEvents:'none' }} />

      {/* Paper sheet with text */}
      <div style={{
        maxWidth:280, padding:'0 36px', position:'relative', zIndex:2,
        animation:`_twr_paper 600ms ${EXPO} backwards`,
      }}>
        {/* Top rule */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:30, opacity:.4 }}>
          <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,transparent,#8a6030)' }} />
          <span style={{ fontSize:8, color:'#8a6030', letterSpacing:2 }}>✦</span>
          <div style={{ flex:1, height:'.5px', background:'linear-gradient(90deg,#8a6030,transparent)' }} />
        </div>

        {/* Line 1 */}
        <p style={{
          margin:'0 0 18px', fontSize:15, lineHeight:1.75,
          color:'rgba(50,30,10,.82)', fontFamily:FD, fontStyle:'italic', minHeight:28,
        }}>
          {line1}
          {line1.length < msg1.length && line1.length > 0 && (
            <span style={{ animation:'_twr_cursor .6s step-end infinite',
              borderRight:'1.8px solid rgba(50,30,10,.65)', marginLeft:1 }} />
          )}
        </p>

        {/* Line 2 */}
        {line1.length >= msg1.length && (
          <p style={{
            margin:'0 0 26px', fontSize:13, fontFamily:FD, fontStyle:'italic',
            color: primaryColor, fontWeight:500, letterSpacing:'.01em', minHeight:22,
          }}>
            {line2}
            {line2.length < msg2.length && (
              <span style={{ animation:'_twr_cursor .6s step-end infinite',
                borderRight:'1.8px solid currentColor', marginLeft:1 }} />
            )}
          </p>
        )}

        {/* Underline decoration — ink stroke */}
        {showMark && (
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            <div style={{
              width:40, height:40, borderRadius:'50%',
              border:`1.5px solid ${primaryColor}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              transform:'rotate(-15deg)',
              opacity:.75,
              animation:`_popIn .45s ${SPR} backwards`,
            }}>
              <span style={{ fontSize:16, color:primaryColor }}>♡</span>
            </div>
          </div>
        )}

        {/* Hint */}
        {showHint && (
          <div style={{ display:'flex', alignItems:'center', gap:8, animation:'_hint 2.4s ease-in-out infinite' }}>
            <div style={{ flex:1, height:'.5px', background:'rgba(100,60,20,.18)' }} />
            <span style={{ fontSize:8, letterSpacing:'.2em', textTransform:'uppercase',
              color:'rgba(100,60,20,.38)', fontFamily:FS }}>nhấn để tiếp tục</span>
            <div style={{ flex:1, height:'.5px', background:'rgba(100,60,20,.18)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
