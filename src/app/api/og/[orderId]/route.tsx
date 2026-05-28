import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getAdminDb } from '@/libs/firebase-admin';
import { FIRESTORE_COLLECTIONS, TEMPLATES } from '@/configs/constants';

export const runtime = 'nodejs';

const OG_W = 1200;
const OG_H = 630;

/* ── Font — loaded once per worker lifecycle ────────────────────────────────── */
let _fontRegular: ArrayBuffer | null = null;
function loadFont(): ArrayBuffer {
  if (_fontRegular) return _fontRegular;
  const p = join(process.cwd(), 'public', 'fonts', 'NotoSans-Regular.ttf');
  _fontRegular = readFileSync(p).buffer as ArrayBuffer;
  return _fontRegular;
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

/* ── Fallback card (Firestore error / no data) ─────────────────────────────── */
function FallbackCard() {
  return (
    <div
      style={{
        display: 'flex',
        width: OG_W,
        height: OG_H,
        background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 60%, #c084fc 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <span style={{ fontSize: 80, color: 'white', fontWeight: 900, letterSpacing: -2 }}>
        ✦ tapory
      </span>
      <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.72)', marginTop: 16 }}>
        Góc Chạm — NFC Memory Card
      </span>
    </div>
  );
}

/* ── Route handler ─────────────────────────────────────────────────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  let fontData: ArrayBuffer | undefined;
  try { fontData = loadFont(); } catch { /* font missing → renders without */ }

  try {
    const db   = getAdminDb();
    const snap = await db.collection(FIRESTORE_COLLECTIONS.MEMORIALS).doc(orderId).get();
    const data = snap.exists ? snap.data() : null;

    if (!data) {
      return new ImageResponse(<FallbackCard />, {
        width: OG_W, height: OG_H,
        ...(fontData ? { fonts: [{ name: 'Noto Sans', data: fontData, weight: 400, style: 'normal' }] } : {}),
      });
    }

    const title      = truncate((data.title      as string) || 'Kỷ Niệm Của Tôi', 52);
    const subtitle   = truncate((data.subtitle   as string) || '', 80);
    const imageUrl   = (data.imageUrl  as string) || '';
    const templateId = (data.templateId as string) || 'birthday';
    const date       = (data.date      as string) || '';

    const tpl         = TEMPLATES[templateId as keyof typeof TEMPLATES];
    const primary     = tpl?.colors.primary    || '#6366f1';
    const secondary   = tpl?.colors.secondary  || '#a5b4fc';
    const tplLabel    = tpl ? `${tpl.icon} ${tpl.name}` : '✨ Tapory';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: OG_W,
            height: OG_H,
            background: '#ffffff',
            fontFamily: "'Noto Sans', sans-serif",
          }}
        >
          {/* ── Left: photo panel (420 × 630) ── */}
          <div
            style={{
              display: 'flex',
              width: 420,
              height: OG_H,
              flexShrink: 0,
              background: `linear-gradient(160deg, ${secondary}88, ${primary}66)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                width={420}
                height={OG_H}
                style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            )}
            {/* right-fade so photo blends into white content area */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(90deg, transparent 55%, rgba(255,255,255,0.96) 100%)',
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
              padding: '44px 56px 44px 40px',
            }}
          >
            {/* Template badge */}
            <div
              style={{
                display: 'flex',
                background: `${primary}18`,
                borderRadius: 10,
                padding: '6px 16px',
                marginBottom: 24,
                alignSelf: 'flex-start',
              }}
            >
              <span style={{ color: primary, fontSize: 16, fontWeight: 700 }}>
                {tplLabel}
              </span>
            </div>

            {/* Title */}
            <span
              style={{
                fontSize: 46,
                fontWeight: 800,
                color: '#111111',
                lineHeight: 1.15,
                marginBottom: 16,
              }}
            >
              {title}
            </span>

            {/* Subtitle */}
            {subtitle && (
              <span
                style={{
                  fontSize: 22,
                  color: '#666666',
                  lineHeight: 1.45,
                  marginBottom: 8,
                }}
              >
                {subtitle}
              </span>
            )}

            {/* Date */}
            {date && (
              <span style={{ fontSize: 17, color: '#aaaaaa', marginTop: 10 }}>
                📅 {date}
              </span>
            )}

            {/* Divider + Tapory brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 40,
                paddingTop: 24,
                borderTop: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#6366f1',
                  letterSpacing: -0.5,
                }}
              >
                ✦ tapory
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: '#bbbbbb',
                  marginLeft: 14,
                }}
              >
                Góc Chạm — NFC Memory Card
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: OG_W,
        height: OG_H,
        ...(fontData
          ? { fonts: [{ name: 'Noto Sans', data: fontData, weight: 400, style: 'normal' as const }] }
          : {}),
      },
    );
  } catch {
    return new ImageResponse(<FallbackCard />, {
      width: OG_W, height: OG_H,
      ...(fontData ? { fonts: [{ name: 'Noto Sans', data: fontData, weight: 400, style: 'normal' as const }] } : {}),
    });
  }
}
