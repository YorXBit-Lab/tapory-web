import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

const DANCE = "var(--font-dancing),'Dancing Script',cursive";

// Static bokeh positions for the description area — defined outside to avoid re-creation
const BOKEH = [
  { x:10, y:15, s:34, o:.055 }, { x:74, y:28, s:22, o:.045 },
  { x:88, y:60, s:40, o:.038 }, { x:6,  y:78, s:26, o:.055 },
  { x:55, y:84, s:18, o:.048 }, { x:82, y:90, s:30, o:.062 },
  { x:32, y:68, s:14, o:.042 }, { x:64, y:52, s:20, o:.050 },
];

function InfinityDivider({ color }: { color: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, width:'100%' }}>
      <div style={{ flex:1, height:.5,
        background:`linear-gradient(90deg,transparent,${color}45)` }}/>
      <svg width="30" height="14" viewBox="0 0 30 14" fill="none">
        <path
          d="M15,7 C15,4.2 12.4,2 8.5,2 C4.6,2 1,4.8 1,7 C1,9.2 4.6,12 8.5,12 C12.4,12 15,9.8 15,7 C15,4.2 17.6,2 21.5,2 C25.4,2 29,4.8 29,7 C29,9.2 25.4,12 21.5,12 C17.6,12 15,9.8 15,7Z"
          stroke={color} strokeWidth="1.2" opacity=".6"/>
        <circle cx="15" cy="7" r="1.5" fill={color} opacity=".5"/>
      </svg>
      <div style={{ flex:1, height:.5,
        background:`linear-gradient(90deg,${color}45,transparent)` }}/>
    </div>
  );
}

export function WedStory({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'full';

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: '#0d0d0d' }}>

      {/* Film grain — screen blend, on top of everything */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:20,
        opacity:.048, mixBlendMode:'screen' as const,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}/>

      {/* ── Full ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: 306 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt=""
                style={{ filter: imgFilter }}/>
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background:'#1c1c1c', fontFamily:DANCE, fontSize:42,
                  color:c.secondary, opacity:.5 }}>∞</div>}
          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0" style={{
            background:'linear-gradient(to bottom,rgba(0,0,0,.06) 0%,transparent 38%,rgba(0,0,0,.78) 100%)',
          }}/>
          {/* Edge vignette */}
          <div className="absolute inset-0" style={{
            background:'radial-gradient(ellipse at center,transparent 52%,rgba(0,0,0,.40) 100%)',
          }}/>
          {/* Bottom text block */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 text-center">
            <p style={{ fontFamily:DANCE, fontSize:11, color:c.secondary,
              letterSpacing:'.12em', marginBottom:5, opacity:.82 }}>
              Wedding Day
            </p>
            <p className="font-bold leading-tight text-white"
              style={{ fontFamily:font, fontSize:titleSize }}>
              {data.title || 'Tên đôi'}
            </p>
            {data.date && (
              <p className="mt-1.5 text-[9.5px] font-light tracking-[.26em] uppercase"
                style={{ color:c.secondary, opacity:.72 }}>
                {fmt(data.date)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Circle ── */}
      {mode === 'circle' && (
        <div className="flex flex-col items-center px-6 pt-11 pb-3">
          <p style={{ fontFamily:DANCE, fontSize:13, color:c.secondary,
            letterSpacing:'.1em', marginBottom:14, opacity:.78 }}>
            Wedding Day
          </p>
          <div style={{ width:156, height:156, borderRadius:'50%', overflow:'hidden', flexShrink:0,
            border:`2px solid ${c.secondary}50`,
            boxShadow:`0 0 0 5px ${c.secondary}12, 0 8px 32px rgba(0,0,0,.65)` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover" alt=""
                  style={{ filter: imgFilter }}/>
              : <div className="flex h-full w-full items-center justify-center"
                  style={{ background:'#1a1a1a', fontFamily:DANCE, fontSize:42,
                    color:c.secondary, opacity:.5 }}>∞</div>}
          </div>
          <div className="mt-5 text-center">
            <p className="font-bold leading-tight text-white"
              style={{ fontFamily:font, fontSize:titleSize }}>
              {data.title || 'Tên đôi'}
            </p>
            {data.date && (
              <p className="mt-1.5 text-[9.5px] font-light tracking-[.26em] uppercase"
                style={{ color:c.secondary, opacity:.68 }}>
                {fmt(data.date)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Card ── */}
      {mode === 'card' && (
        <div className="flex flex-col items-center px-6 pt-11 pb-3">
          <p style={{ fontFamily:DANCE, fontSize:13, color:c.secondary,
            letterSpacing:'.1em', marginBottom:14, opacity:.78 }}>
            Wedding Day
          </p>
          <div style={{ padding:3, border:`1.5px solid ${c.secondary}40`,
            boxShadow:`0 6px 26px rgba(0,0,0,.65)` }}>
            <div style={{ width:148, height:114, overflow:'hidden' }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover" alt=""
                    style={{ filter: imgFilter }}/>
                : <div className="flex h-full w-full items-center justify-center"
                    style={{ background:'#1a1a1a', fontFamily:DANCE, fontSize:42,
                      color:c.secondary, opacity:.5 }}>∞</div>}
            </div>
          </div>
          <div className="mt-5 text-center">
            <p className="font-bold leading-tight text-white"
              style={{ fontFamily:font, fontSize:titleSize }}>
              {data.title || 'Tên đôi'}
            </p>
            {data.date && (
              <p className="mt-1.5 text-[9.5px] font-light tracking-[.26em] uppercase"
                style={{ color:c.secondary, opacity:.68 }}>
                {fmt(data.date)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Description — cinematic dark atmosphere ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-6 py-5 text-center">
        {/* Bokeh atmosphere dots */}
        {BOKEH.map((b, i) => (
          <div key={i} style={{
            position:'absolute', left:`${b.x}%`, top:`${b.y}%`,
            width:b.s, height:b.s, borderRadius:'50%',
            background:`radial-gradient(circle, ${c.secondary} 0%, transparent 68%)`,
            opacity:b.o, transform:'translate(-50%,-50%)',
            filter:'blur(6px)', pointerEvents:'none',
          }}/>
        ))}
        {/* Subtle center ambient */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:`radial-gradient(ellipse 70% 60% at 50% 50%,${c.secondary}06 0%,transparent 100%)` }}/>

        <InfinityDivider color={c.secondary}/>

        <p className="relative z-10 text-[10.5px] leading-[1.88]"
          style={{ color:'rgba(255,255,255,.48)' }}>
          {data.description || 'Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương và gắn bó bên nhau.'}
        </p>
      </div>
    </div>
  );
}
