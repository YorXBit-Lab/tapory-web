import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

const DANCE = "var(--font-dancing),'Dancing Script',cursive";
const SERIF = "var(--font-playfair),'Playfair Display',Georgia,serif";

function Rings({ color }: { color: string }) {
  return (
    <svg width="44" height="24" viewBox="0 0 44 24" fill="none">
      <circle cx="14" cy="12" r="10.5" stroke={color} strokeWidth="1.4"/>
      <circle cx="30" cy="12" r="10.5" stroke={color} strokeWidth="1.4"/>
      <circle cx="14" cy="12" r="7"   stroke={color} strokeWidth=".5" opacity=".3"/>
      <circle cx="30" cy="12" r="7"   stroke={color} strokeWidth=".5" opacity=".3"/>
      {/* tiny gem tops */}
      <circle cx="14" cy="2.5" r="1.2" fill={color} opacity=".55"/>
      <circle cx="30" cy="2.5" r="1.2" fill={color} opacity=".55"/>
    </svg>
  );
}

function OrnDivider({ color }: { color: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, width:'100%' }}>
      <div style={{ flex:1, height:.5, background:`linear-gradient(90deg,transparent,${color}50)` }}/>
      <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
        <path d="M10,1 L12,5 L10,9 L8,5Z" fill={color} opacity=".45"/>
        <path d="M1,5 L5,5 M15,5 L19,5" stroke={color} strokeWidth=".8" opacity=".35"/>
        <circle cx="10" cy="5" r="1.2" fill={color} opacity=".6"/>
      </svg>
      <div style={{ flex:1, height:.5, background:`linear-gradient(90deg,${color}50,transparent)` }}/>
    </div>
  );
}

export function WedRomantic({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'full';

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* Watercolor wash layers */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:`radial-gradient(ellipse 90% 48% at 50% 0%, ${c.secondary}2a 0%, transparent 100%)` }}/>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:`radial-gradient(ellipse 55% 38% at 12% 62%, ${c.secondary}16 0%, transparent 70%)` }}/>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:`radial-gradient(ellipse 48% 32% at 88% 78%, ${c.secondary}10 0%, transparent 70%)` }}/>

      {/* ── Full ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: 262 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt=""
                style={{ filter: imgFilter }}/>
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background:'linear-gradient(135deg,#fce7f3,#fdf2f8)' }}>
                <Rings color={c.primary}/>
              </div>}
          <div className="absolute inset-0" style={{
            background:'linear-gradient(to bottom,rgba(0,0,0,.06) 0%,transparent 28%,rgba(253,245,248,.68) 80%,#fdf5f8 100%)',
          }}/>
          <div className="absolute top-[40px] left-0 right-0 flex flex-col items-center gap-1">
            <p style={{ fontFamily:DANCE, fontSize:12, color:'rgba(255,255,255,.92)',
              textShadow:'0 1px 12px rgba(0,0,0,.28)', letterSpacing:'.1em' }}>Wedding</p>
          </div>
        </div>
      )}

      {/* ── Card ── */}
      {mode === 'card' && (
        <div className="flex flex-col items-center px-6 pt-10 pb-2">
          <p style={{ fontFamily:DANCE, fontSize:14, color:c.primary, opacity:.55,
            letterSpacing:'.06em', marginBottom:14 }}>Wedding</p>
          <div style={{ padding:3, border:`1.5px solid ${c.secondary}45`,
            boxShadow:`0 4px 22px ${c.secondary}22` }}>
            <div style={{ width:136, height:166, overflow:'hidden' }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover" alt=""
                    style={{ filter: imgFilter }}/>
                : <div className="flex h-full w-full items-center justify-center"
                    style={{ background:'linear-gradient(135deg,#fce7f3,#fdf2f8)' }}>
                    <Rings color={c.primary}/>
                  </div>}
            </div>
          </div>
        </div>
      )}

      {/* ── Circle ── */}
      {mode === 'circle' && (
        <div className="flex flex-col items-center px-6 pt-10 pb-2">
          <p style={{ fontFamily:DANCE, fontSize:14, color:c.primary, opacity:.55,
            letterSpacing:'.06em', marginBottom:14 }}>Wedding</p>
          <div style={{ width:142, height:142, borderRadius:'50%', overflow:'hidden', flexShrink:0,
            border:`2px solid ${c.secondary}55`,
            boxShadow:`0 0 0 5px ${c.secondary}14, 0 6px 24px ${c.secondary}28` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover" alt=""
                  style={{ filter: imgFilter }}/>
              : <div className="flex h-full w-full items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#fce7f3,#fdf2f8)' }}>
                  <Rings color={c.primary}/>
                </div>}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className={`relative z-10 flex flex-col items-center px-6 pb-8 text-center
        ${mode === 'full' ? '-mt-2' : 'mt-5'}`}>
        {mode === 'full' && <div className="mb-3"><Rings color={c.primary}/></div>}

        <p className="leading-tight" style={{ fontFamily:font, fontSize:titleSize,
          color:c.primary, letterSpacing:'.025em' }}>
          {data.title || 'Tên đôi'}
        </p>

        {data.date && (
          <p className="mt-1.5 text-[9.5px] tracking-[0.32em] uppercase"
            style={{ fontFamily:SERIF, color:c.secondary, fontWeight:500 }}>
            {fmt(data.date)}
          </p>
        )}

        <div className="my-4 w-full px-1">
          <OrnDivider color={c.primary}/>
        </div>

        <p className="text-[10.5px] leading-[1.85]" style={{ color:c.primary, opacity:.60 }}>
          {data.description || 'Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương và gắn bó bên nhau.'}
        </p>
      </div>
    </div>
  );
}
