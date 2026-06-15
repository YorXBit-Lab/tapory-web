'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FS, EXPO, SPR, WRAP, useFadeOut, Skip, type BaseProps } from './shared';

export function PolaroidIntro({ onComplete, primaryColor, title, imageUrl }: BaseProps) {
  type Ph = 'landing' | 'idle' | 'developing';
  const [ph, setPh] = useState<Ph>('landing');
  const { fading, trigger, style: fs } = useFadeOut(onComplete);

  useEffect(() => {
    const t = setTimeout(() => setPh('idle'), 980);
    return () => clearTimeout(t);
  }, []);

  const tap = useCallback(() => {
    if (ph !== 'idle' || fading) return;
    setPh('developing');
    setTimeout(() => trigger(), 3600);
  }, [ph, fading, trigger]);

  // 6 scattered bg polaroids — static, blurred, different tints
  const bgPols = useMemo(() => [
    { x:7,  y:14, r:-18, w:82,  h:106, c:'#c45a2a', o:.24 },
    { x:82, y:10, r:14,  w:72,  h:92,  c:'#3a6a8a', o:.20 },
    { x:88, y:70, r:20,  w:90,  h:116, c:'#8a5220', o:.22 },
    { x:6,  y:74, r:-13, w:76,  h:96,  c:'#5a2a6a', o:.18 },
    { x:65, y:85, r:-8,  w:66,  h:84,  c:'#2a6a58', o:.20 },
    { x:20, y:48, r:-24, w:58,  h:74,  c:'#7a4218', o:.16 },
  ], []);

  // 14 warm amber bokeh lights
  const bokehs = useMemo(() => [...Array(14)].map((_, i) => ({
    x:   [8, 20, 32, 48, 60, 72, 84, 90, 14, 28, 44, 58, 70, 82][i],
    y:   [18, 75, 25, 88, 10, 68, 38, 82, 50, 20, 62, 42, 28, 55][i],
    s:   [7,  11,  8, 15,  7, 13,  9, 17,  6, 12,  8, 14,  7, 11][i],
    o:   [.15,.10,.20,.07,.14,.12,.18,.09,.13,.16,.11,.14,.12,.17][i],
    d:   i * 0.42,
    dur: 2.6 + (i % 5) * 0.55,
  })), []);

  // photo bokeh blobs inside polaroid
  const photoBlobs = useMemo(() => [
    { l:20, t:25, s:44, o:.22 }, { l:55, t:18, s:30, o:.18 },
    { l:68, t:58, s:52, o:.15 }, { l:38, t:65, s:36, o:.20 },
    { l:82, t:32, s:24, o:.14 }, { l:50, t:45, s:18, o:.12 },
  ], []);

  const isDark = ph === 'landing' || ph === 'idle';

  return (
    <div onClick={tap} style={{
      ...WRAP,
      cursor: ph === 'idle' ? 'pointer' : 'default',
      background: 'radial-gradient(ellipse at 48% 28%, #271309 0%, #150902 50%, #0c0602 100%)',
      ...fs,
    }}>
      {/* Amber safelight — top */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 75% 38% at 50% 0%, rgba(210,85,15,.2) 0%, transparent 100%)' }} />
      {/* Warm pool — bottom */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 80% 35% at 50% 100%, rgba(160,55,8,.09) 0%, transparent 100%)' }} />
      {/* Film grain */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:.042,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />

      {/* ── Bokeh lights ── */}
      {bokehs.map((b, i) => (
        <div key={i} style={{
          position:'absolute', left:`${b.x}%`, top:`${b.y}%`,
          width:b.s, height:b.s, borderRadius:'50%',
          background:`radial-gradient(circle, rgba(225,130,45,${(b.o*2.8).toFixed(2)}) 0%, rgba(195,80,15,${b.o.toFixed(2)}) 45%, transparent 72%)`,
          transform:'translate(-50%,-50%)',
          ['--bo' as string]: b.o.toFixed(3),
          animation:`_pol_bokeh ${b.dur}s ease-in-out ${b.d.toFixed(2)}s infinite`,
        }} />
      ))}

      {/* ── Scattered bg polaroids ── */}
      {bgPols.map((p, i) => (
        <div key={i} style={{
          position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
          width:p.w, height:p.h,
          transform:`translate(-50%,-50%) rotate(${p.r}deg)`,
          background:'linear-gradient(160deg, #f6f0e4 0%, #ede6d8 100%)',
          borderRadius:2, padding:'7px 7px 0',
          boxShadow:'0 6px 20px rgba(0,0,0,.65), 0 2px 6px rgba(0,0,0,.4)',
          filter:'blur(1.8px)', opacity:p.o,
        }}>
          <div style={{
            width:'100%', height:p.h - 26,
            background:`linear-gradient(138deg, ${p.c}cc 0%, ${p.c}55 100%)`,
            borderRadius:1,
          }} />
          <div style={{ height:20, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:22, height:1, background:'rgba(90,55,25,.22)', borderRadius:1 }} />
          </div>
        </div>
      ))}

      {/* ── Main polaroid ── */}
      <div style={{ position:'relative', zIndex:10 }}>
        <div style={{
          width:192, height:248,
          animation: ph === 'landing'
            ? `_pol_land 980ms ${SPR} forwards`
            : `_pol_sway 4.2s ease-in-out infinite`,
        }}>
          {/* White polaroid frame — slightly warm tint */}
          <div style={{
            width:'100%', height:'100%',
            background:'linear-gradient(160deg, #f9f4ec 0%, #f1ebe0 100%)',
            borderRadius:3,
            padding:'12px 12px 0',
            boxShadow:
              '0 30px 75px rgba(0,0,0,.9),' +
              '0 10px 30px rgba(0,0,0,.65),' +
              '0 3px 8px rgba(0,0,0,.45),' +
              'inset 0 0 0 .5px rgba(255,255,255,.75)',
            display:'flex', flexDirection:'column', overflow:'hidden',
          }}>

            {/* ── Photo area ── */}
            <div style={{
              flex:1, position:'relative', overflow:'hidden',
              borderRadius:'1.5px 1.5px 0 0',
              filter: isDark ? 'brightness(.05) saturate(0) sepia(1)' : undefined,
              animation: ph === 'developing' ? `_pol_develop 3.2s ${EXPO} forwards` : undefined,
            }}>
              {imageUrl ? (
                /* ── User photo ── */
                <>
                  <img
                    src={imageUrl}
                    alt=""
                    style={{
                      position:'absolute', inset:0,
                      width:'100%', height:'100%',
                      objectFit:'cover', objectPosition:'center',
                      display:'block',
                    }}
                  />
                  {/* Vignette over photo */}
                  <div style={{ position:'absolute', inset:0,
                    background:'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,.45) 100%)' }} />
                </>
              ) : (
                /* ── Fallback: bokeh + heart ── */
                <>
                  {/* Dark base */}
                  <div style={{ position:'absolute', inset:0,
                    background:'linear-gradient(145deg, #1c1016 0%, #0e0810 100%)' }} />
                  {/* Primary color tint */}
                  <div style={{ position:'absolute', inset:0, background:primaryColor, opacity:.24 }} />

                  {/* Bokeh blobs */}
                  {photoBlobs.map((b, i) => (
                    <div key={i} style={{
                      position:'absolute', left:`${b.l}%`, top:`${b.t}%`,
                      width:b.s, height:b.s, borderRadius:'50%',
                      background:primaryColor, opacity:b.o,
                      filter:'blur(10px)',
                      transform:'translate(-50%,-50%)',
                    }} />
                  ))}

                  {/* Central heart */}
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="62" height="58" viewBox="0 0 62 58" fill="none"
                      style={{ filter:`drop-shadow(0 0 12px ${primaryColor}99) drop-shadow(0 0 4px ${primaryColor}66)` }}>
                      {/* Outer soft halo */}
                      <path
                        d="M31,52 C43,43 54,32 54,20 C54,12 49,7 42,7 C38,7 34.5,9.5 31,14.5 C27.5,9.5 24,7 20,7 C13,7 8,12 8,20 C8,32 19,43 31,52Z"
                        fill={primaryColor} opacity=".22"
                      />
                      {/* Main heart — smooth 6-segment bezier */}
                      <path
                        d="M31,49 C43,40 52,30 52,20 C52,13 47.5,9 42,9 C38.5,9 35.5,11 31,16 C26.5,11 23.5,9 20,9 C14.5,9 10,13 10,20 C10,30 19,40 31,49Z"
                        fill={primaryColor} opacity=".7"
                      />
                      {/* Inner highlight layer — top half only, lighter */}
                      <path
                        d="M31,34 C38,28 46,22 46,16 C46,12 43,10 39.5,10 C37,10 35,11.5 31,16 C27,11.5 25,10 22.5,10 C19,10 16,12 16,16 C16,22 24,28 31,34Z"
                        fill="rgba(255,255,255,.12)"
                      />
                      {/* Left inner highlight arc */}
                      <path d="M17,16 C16,18 15,22 15,26"
                        stroke="rgba(255,255,255,.42)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                      {/* Glint dots */}
                      <circle cx="43" cy="13" r="1.5" fill="rgba(255,255,255,.65)"/>
                      <circle cx="48" cy="22" r=".9" fill="rgba(255,255,255,.42)"/>
                      <circle cx="38" cy="10" r=".7" fill="rgba(255,255,255,.5)"/>
                    </svg>
                  </div>

                  {/* Photo vignette */}
                  <div style={{ position:'absolute', inset:0,
                    background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.55) 100%)' }} />
                </>
              )}
            </div>

            {/* ── Caption strip ── */}
            <div style={{
              height:56, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:4, padding:'0 10px',
            }}>
              <p style={{
                margin:0, fontSize:14,
                fontFamily:`var(--font-dancing),'Dancing Script',cursive`,
                color:'#4a2e14', textAlign:'center', lineHeight:1.2,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%',
                opacity: isDark ? 0 : 1,
                transition:'opacity 1s ease 1.9s',
              }}>
                {title || 'Một khoảnh khắc'}
              </p>
              <p style={{
                margin:0, fontSize:7.5, fontFamily:FS,
                color:'rgba(110,70,35,.42)', letterSpacing:'.2em',
                opacity: isDark ? 0 : 1,
                transition:'opacity 0.8s ease 2.5s',
              }}>
                ♡ &nbsp; {new Date().getFullYear()} &nbsp; ♡
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hint / status */}
      {ph === 'idle' && (
        <p style={{
          marginTop:30, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
          color:'rgba(220,130,55,.38)', fontFamily:FS,
          animation:'_hint 2.4s ease-in-out infinite',
        }}>
          chạm để xem ảnh
        </p>
      )}
      {ph === 'developing' && (
        <p style={{
          marginTop:30, fontSize:9, letterSpacing:'.18em', textTransform:'uppercase',
          color:'rgba(205,105,40,.6)', fontFamily:FS,
          animation:'_pulse 1.6s ease-in-out infinite',
        }}>
          đang hiện ảnh…
        </p>
      )}

      <Skip onClick={trigger} />
    </div>
  );
}
