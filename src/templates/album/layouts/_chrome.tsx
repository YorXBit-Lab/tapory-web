'use client';
import { fmt } from '@/shared/utils/fmt';
import type { IEditDraft } from '@/configs/types';
import type { LayoutColors } from '@/templates/types';

/** Hằng số keyframes dùng chung cho mọi layout album — gom 1 chỗ để tránh trùng. */
export const ALBUM_KEYFRAMES = `
@keyframes albStageIn   { 0% { opacity:0; transform: scale(.72); } 100% { opacity:1; transform: scale(1); } }
@keyframes albRise      { 0% { transform: translateY(10px); opacity:0; } 12% { opacity:.85; } 88% { opacity:.5; } 100% { transform: translateY(-130px); opacity:0; } }
@keyframes albAuroraA   { 0%,100% { transform: translate(-6%,-3%) scale(1); } 50% { transform: translate(7%,5%) scale(1.18); } }
@keyframes albAuroraB   { 0%,100% { transform: translate(6%,4%) scale(1.12); } 50% { transform: translate(-6%,-5%) scale(.92); } }
@keyframes albRingSpin  { 0% { transform: translate(-50%,-50%) rotateX(74deg) rotate(0); } 100% { transform: translate(-50%,-50%) rotateX(74deg) rotate(360deg); } }
@keyframes albGlowPulse { 0%,100% { opacity:.42; transform: scale(1); } 50% { opacity:.78; transform: scale(1.08); } }
@keyframes albHeartbeat { 0%,28%,100% { transform: scale(1); } 14% { transform: scale(1.055); } 21% { transform: scale(1.015); } }
@keyframes albFloatY    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes albHeartGlow { 0%,100% { opacity:.45; transform: scale(1); } 50% { opacity:.8; transform: scale(1.07); } }
@keyframes albSheen     { 0% { transform: translateX(-130%) skewX(-18deg); } 100% { transform: translateX(180%) skewX(-18deg); } }
@keyframes albAssemble  { 0% { opacity:0; transform: translate(var(--ax,0px), var(--ay,0px)) scale(.18) rotate(var(--ar,0deg)); } 55% { opacity:1; } 100% { opacity:1; transform: translate(0,0) scale(1) rotate(0deg); } }
@keyframes albAssemble3D { 0% { opacity:0; transform: translate3d(var(--ax,0px), var(--ay,0px), var(--azs,160px)) scale(.16) rotateY(var(--ar,0deg)); } 55% { opacity:1; } 100% { opacity:1; transform: translate3d(0,0,var(--zf,0px)) scale(1) rotateY(0deg); } }
@keyframes albHeartSway { 0%,100% { transform: rotateY(0deg) rotateX(3deg); } 25% { transform: rotateY(14deg) rotateX(-2deg); } 75% { transform: rotateY(-14deg) rotateX(5deg); } }
@keyframes albFadeIn    { 0% { opacity:0; } 100% { opacity:1; } }`;

/** PRNG tất định theo index — an toàn SSR (không lệch hydrate như Math.random). */
export const seeded = (i: number, salt = 0) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233 + 0.5) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Lớp nền chung: 2 khối aurora trôi nhẹ + vignette ôm khung.
 * Buộc toàn bộ bố cục (header · sân khấu · footer) vào một không gian sáng thống nhất.
 */
export function AlbumBackdrop({ c }: { c: LayoutColors }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-1/4 top-[8%] h-3/4 w-3/4 rounded-full"
        style={{ background: `radial-gradient(closest-side, ${c.secondary}2e, transparent 70%)`, filter: 'blur(8px)', animation: 'albAuroraA 16s ease-in-out infinite' }} />
      <div className="absolute -right-1/4 bottom-[2%] h-3/4 w-3/4 rounded-full"
        style={{ background: `radial-gradient(closest-side, ${c.secondary}24, transparent 70%)`, filter: 'blur(8px)', animation: 'albAuroraB 19s ease-in-out infinite' }} />
      <div className="absolute inset-0"
        style={{ background: `radial-gradient(120% 80% at 50% 44%, transparent 46%, ${c.accent}cc 100%)` }} />
    </div>
  );
}

/** Hạt bụi sáng bay lên — tạo chiều sâu, sức sống. Vị trí tất định theo index. */
export function AlbumParticles({ c, count = 16 }: { c: LayoutColors; count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = seeded(i, 1) * 100;
        const size = 1.6 + seeded(i, 2) * 3.2;
        const dur = 7 + seeded(i, 3) * 8;
        const delay = -seeded(i, 4) * dur;
        const bottom = seeded(i, 5) * 38;
        return (
          <span key={i} className="absolute rounded-full"
            style={{
              left: `${left}%`, bottom: `${bottom}%`, width: size, height: size,
              background: c.secondary, opacity: 0.5,
              boxShadow: `0 0 ${size * 2.4}px ${c.secondary}`,
              animation: `albRise ${dur}s linear ${delay}s infinite`,
            }} />
        );
      })}
    </div>
  );
}

/** Tim ♥ bay lên từ đáy — nền lãng mạn, vị trí tất định theo index (an toàn SSR). */
export function FloatingHearts({ color, count = 9 }: { color: string; count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const dur = 8 + seeded(i, 21) * 7;
        return (
          <span key={i} className="absolute"
            style={{
              left: `${seeded(i, 20) * 100}%`, bottom: `${seeded(i, 24) * 30}%`,
              fontSize: 7 + seeded(i, 22) * 9, color, opacity: 0.45,
              textShadow: `0 0 8px ${color}`,
              animation: `albRise ${dur}s linear ${-seeded(i, 23) * dur}s infinite`,
            }}>♥</span>
        );
      })}
    </div>
  );
}

/** Sân khấu nền (đèn nền + đốm sáng đáy) đặt khối 3D vào một không gian có chiều sâu. */
export function AlbumStageGlow({ c, pulse = false }: { c: LayoutColors; pulse?: boolean }) {
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `${c.secondary}55`, filter: 'blur(38px)', animation: pulse ? 'albGlowPulse 2.6s ease-in-out infinite' : undefined }} />
      <div className="pointer-events-none absolute left-1/2 top-[68%] h-10 w-52 -translate-x-1/2 rounded-[50%]"
        style={{ background: `radial-gradient(closest-side, ${c.secondary}40, transparent 72%)`, filter: 'blur(10px)' }} />
    </>
  );
}

interface HeaderProps {
  data: IEditDraft;
  c: LayoutColors;
  font: string;
  titleSize: string | number;
  kicker?: string;
}

/** Header thống nhất: nhãn nhỏ giữa hai đường mảnh + tiêu đề có quầng sáng + ngày. */
export function AlbumHeader({ data, c, font, titleSize, kicker = 'Album' }: HeaderProps) {
  return (
    <div className="relative z-10 px-6 pt-6 text-center">
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="h-px w-5" style={{ background: `linear-gradient(to right, transparent, ${c.secondary})`, opacity: 0.8 }} />
        <p className="text-[7px] font-bold uppercase tracking-[0.55em]" style={{ color: c.secondary, opacity: 0.9 }}>{kicker}</p>
        <span className="h-px w-5" style={{ background: `linear-gradient(to left, transparent, ${c.secondary})`, opacity: 0.8 }} />
      </div>
      <p className="font-bold leading-tight" style={{ fontFamily: font, fontSize: typeof titleSize === 'number' ? titleSize * 0.82 : `calc(${titleSize} * 0.82)`, color: c.primary, textShadow: `0 2px 26px ${c.secondary}3a` }}>
        {data.title || 'Album kỷ niệm'}
      </p>
      {data.date && (
        <p className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.4em]" style={{ color: c.secondary, opacity: 0.85 }}>{fmt(data.date)}</p>
      )}
    </div>
  );
}

interface FooterProps {
  data: IEditDraft;
  c: LayoutColors;
  font: string;
  hint: string;
}

/** Footer thống nhất: lời nhắn + dòng gợi ý tương tác. */
export function AlbumFooter({ data, c, font, hint }: FooterProps) {
  return (
    <div className="relative z-10 px-6 pb-5 text-center">
      {data.description && (
        <p className="mx-auto max-w-[92%] text-[9px] italic leading-relaxed" style={{ fontFamily: font, color: c.primary, opacity: 0.74 }}>
          {data.description}
        </p>
      )}
      <p className="mt-2 text-[8px]" style={{ color: c.primary, opacity: 0.5 }}>{hint}</p>
    </div>
  );
}
