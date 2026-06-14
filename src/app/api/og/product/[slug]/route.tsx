import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getProductForSeoBySlug } from '@/libs/products-server';

export const runtime = 'nodejs';
// Cache the generated card per slug for 1h; the product card rarely changes.
export const revalidate = 3600;

const OG_W = 1200;
const OG_H = 630;

/* ── Brand palette (matches /opengraph-image) ───────────────────────────────── */
const BRAND = '#8b6b52';
const BG = '#f8f4ee';
const INK = '#2c2118';
const MUTED = '#6e5a4a';

/* ── Font — loaded once per worker lifecycle ────────────────────────────────── */
let _font: ArrayBuffer | null = null;
function loadFont(): ArrayBuffer {
  if (_font) return _font;
  const p = join(process.cwd(), 'public', 'fonts', 'NotoSans-Regular.ttf');
  _font = readFileSync(p).buffer as ArrayBuffer;
  return _font;
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

const fmtPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

/* ── Fallback card (no product / error) ─────────────────────────────────────── */
function FallbackCard() {
  return (
    <div
      style={{
        display: 'flex',
        width: OG_W,
        height: OG_H,
        background: BG,
        color: INK,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <span style={{ fontSize: 64, fontWeight: 900, color: BRAND, letterSpacing: 2 }}>
        GÓC CHẠM
      </span>
      <span style={{ fontSize: 28, color: MUTED, marginTop: 16 }}>
        Móc khóa in ảnh theo yêu cầu
      </span>
    </div>
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let fontData: ArrayBuffer | undefined;
  try { fontData = loadFont(); } catch { /* font missing → renders without */ }

  const fontOpt = fontData
    ? { fonts: [{ name: 'Noto Sans', data: fontData, weight: 400 as const, style: 'normal' as const }] }
    : {};

  try {
    const product = await getProductForSeoBySlug(slug);

    if (!product) {
      return new ImageResponse(<FallbackCard />, { width: OG_W, height: OG_H, ...fontOpt });
    }

    const name = truncate(product.name, 64);
    const description = truncate(product.description?.trim() || 'Móc khóa cá nhân hóa, lưu giữ kỷ niệm bằng một cái chạm.', 110);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: OG_W,
            height: OG_H,
            background: BG,
            fontFamily: "'Noto Sans', sans-serif",
          }}
        >
          {/* ── Left: product photo (480 × 630) ── */}
          <div
            style={{
              display: 'flex',
              width: 480,
              height: OG_H,
              flexShrink: 0,
              background: `linear-gradient(160deg, ${BRAND}55, ${BRAND}22)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {product.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt=""
                width={480}
                height={OG_H}
                style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: `linear-gradient(90deg, transparent 60%, ${BG}f2 100%)`,
              }}
            />
          </div>

          {/* ── Right: content panel ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              padding: '48px 60px 48px 44px',
            }}
          >
            {/* Brand + NFC badge */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
              <span style={{ color: BRAND, fontSize: 22, fontWeight: 800, letterSpacing: 2 }}>
                GÓC CHẠM
              </span>
              {product.canBeNfc && (
                <div
                  style={{
                    display: 'flex',
                    background: BRAND,
                    borderRadius: 8,
                    padding: '4px 12px',
                    marginLeft: 18,
                  }}
                >
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>
                    NFC
                  </span>
                </div>
              )}
            </div>

            {/* Product name */}
            <span
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: INK,
                lineHeight: 1.12,
                marginBottom: 18,
              }}
            >
              {name}
            </span>

            {/* Description */}
            <span style={{ fontSize: 22, color: MUTED, lineHeight: 1.45 }}>
              {description}
            </span>

            {/* Price */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginTop: 36,
                paddingTop: 26,
                borderTop: `1px solid ${BRAND}33`,
              }}
            >
              <span style={{ fontSize: 44, fontWeight: 900, color: BRAND }}>
                {fmtPrice(product.price)}
              </span>
            </div>
          </div>
        </div>
      ),
      { width: OG_W, height: OG_H, ...fontOpt },
    );
  } catch {
    return new ImageResponse(<FallbackCard />, { width: OG_W, height: OG_H, ...fontOpt });
  }
}
