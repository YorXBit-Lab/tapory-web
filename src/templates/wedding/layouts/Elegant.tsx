import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

const SERIF = "var(--font-playfair),'Playfair Display',Georgia,serif";

function GoldHeader({ color }: { color: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-[5px]">
      {/* top double rule */}
      <div style={{ display:'flex', alignItems:'center', gap:6, width:'100%' }}>
        <div style={{ flex:1, height:.5, background:`linear-gradient(90deg,transparent,${color}80)` }}/>
        <svg width="6" height="6" viewBox="0 0 6 6" fill={color} opacity=".7">
          <path d="M3 0L3.7 2.3H6L4.1 3.7L4.8 6L3 4.6L1.2 6L1.9 3.7L0 2.3H2.3Z"/>
        </svg>
        <div style={{ flex:1, height:.5, background:`linear-gradient(90deg,${color}80,transparent)` }}/>
      </div>
      <p style={{ fontFamily:SERIF, fontSize:8.5, letterSpacing:'.48em', color,
        textTransform:'uppercase', fontWeight:700 }}>
        Wedding
      </p>
      {/* bottom double rule */}
      <div style={{ display:'flex', alignItems:'center', gap:6, width:'100%' }}>
        <div style={{ flex:1, height:.5, background:`linear-gradient(90deg,transparent,${color}55)` }}/>
        <div style={{ width:3, height:3, transform:'rotate(45deg)', backgroundColor:color, opacity:.5 }}/>
        <div style={{ flex:1, height:.5, background:`linear-gradient(90deg,${color}55,transparent)` }}/>
      </div>
    </div>
  );
}

function GoldDivider({ color }: { color: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, width:'100%' }}>
      <div style={{ flex:1, height:.5, background:`linear-gradient(90deg,transparent,${color}60)` }}/>
      <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
        <path d="M12,1 L13.5,4 L12,7 L10.5,4Z" fill={color} opacity=".55"/>
        <line x1="0" y1="4" x2="8.5" y2="4" stroke={color} strokeWidth=".5" opacity=".4"/>
        <line x1="15.5" y1="4" x2="24" y2="4" stroke={color} strokeWidth=".5" opacity=".4"/>
        <circle cx="3"  cy="4" r=".8" fill={color} opacity=".35"/>
        <circle cx="21" cy="4" r=".8" fill={color} opacity=".35"/>
      </svg>
      <div style={{ flex:1, height:.5, background:`linear-gradient(90deg,${color}60,transparent)` }}/>
    </div>
  );
}

export function WedElegant({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'card';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden px-6 pb-8 pt-7"
      style={{ backgroundColor: '#fafaf8' }}>

      {/* Parchment grain */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:.028,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}/>
      {/* Warm corner tints */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:90, pointerEvents:'none',
        background:`linear-gradient(to bottom,${c.secondary}0a,transparent)` }}/>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, pointerEvents:'none',
        background:`linear-gradient(to top,${c.secondary}07,transparent)` }}/>

      {/* Header */}
      <div className="mb-5 w-full">
        <GoldHeader color={c.secondary}/>
      </div>

      {/* ── Full ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0 -mx-6"
          style={{ width:'calc(100% + 48px)', height:172 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt=""
                style={{ filter: imgFilter }}/>
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background:'#e9e6df', fontFamily:SERIF, fontSize:28, color:c.secondary }}>
                ◆
              </div>}
          <div style={{ position:'absolute', inset:0,
            background:`linear-gradient(to bottom,transparent 55%,#fafaf8 100%)` }}/>
        </div>
      )}

      {/* ── Card ── */}
      {mode === 'card' && (
        <div className="flex-shrink-0" style={{
          padding:3,
          border:`1.5px solid ${c.secondary}`,
          boxShadow:`0 2px 18px rgba(0,0,0,.10), 0 0 0 6px ${c.secondary}0a`,
        }}>
          <div className="overflow-hidden" style={{ width:132, height:116 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover" alt=""
                  style={{ filter: imgFilter }}/>
              : <div className="flex h-full w-full items-center justify-center"
                  style={{ background:'#e9e6df', fontFamily:SERIF, fontSize:28, color:c.secondary }}>
                  ◆
                </div>}
          </div>
        </div>
      )}

      {/* ── Circle ── */}
      {mode === 'circle' && (
        <div style={{ width:130, height:130, borderRadius:'50%', overflow:'hidden', flexShrink:0,
          border:`2px solid ${c.secondary}`,
          boxShadow:`0 0 0 5px ${c.secondary}18, 0 4px 20px rgba(0,0,0,.12)` }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt=""
                style={{ filter: imgFilter }}/>
            : <div className="flex h-full w-full items-center justify-center"
                style={{ background:'#e9e6df', fontFamily:SERIF, fontSize:28, color:c.secondary }}>
                ◆
              </div>}
        </div>
      )}

      {/* Title */}
      <p className="mt-5 text-center font-light leading-tight"
        style={{ fontFamily:font, fontSize:titleSize, color:c.primary, letterSpacing:'.04em' }}>
        {data.title || 'Tên đôi'}
      </p>

      {data.date && (
        <p className="mt-1.5 text-[9.5px] tracking-[0.38em] uppercase"
          style={{ fontFamily:SERIF, color:c.secondary, fontWeight:600 }}>
          {fmt(data.date)}
        </p>
      )}

      <div className="my-4 w-full">
        <GoldDivider color={c.secondary}/>
      </div>

      <p className="text-center text-[10.5px] leading-[1.82]"
        style={{ color:c.primary, opacity:.52 }}>
        {data.description || 'Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương và gắn bó bên nhau.'}
      </p>
    </div>
  );
}
