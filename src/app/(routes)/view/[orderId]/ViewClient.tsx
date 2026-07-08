'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MemorialAPI } from '@/services/MemorialAPI';
import { CardAPI } from '@/services/CardAPI';
import { TemplateRenderer } from '@/features/preview/TemplateRenderer';
import { FrameOverlay } from '@/features/preview/FrameOverlay';
import { EffectOverlay } from '@/features/preview/EffectOverlay';
import { IntroOverlay } from '@/features/preview/IntroOverlay';
import { getScreenBackground } from '@/features/preview/screenBg';
import { getTemplateStyles } from '@/templates/registry';
import { CinematicParallax } from '@/features/view/components/CinematicParallax';
import { TextureMaterial } from '@/features/view/components/TextureMaterial';
import { LightingOverlay } from '@/features/view/components/LightingOverlay';
import { ShareButton } from '@/features/view/components/ShareButton';
import { MusicPulse } from '@/features/view/components/MusicPulse';
import { useMagneticElement } from '@/features/view/hooks/useMagneticElement';
import { useTouchScatter } from '@/features/view/hooks/useTouchScatter';
import '@/templates/init';
import { env } from '@/libs/env';
import { FRAMES, EFFECTS } from '@/configs/constants';
import type { IEditDraft, IMemorial } from '@/configs/types';

const NATIVE_W = 232;
const NATIVE_H = 500;

const spinStyle = `@keyframes _tapory_spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`;

function Spinner({ size = 36, color = 'rgba(0,0,0,0.35)' }: { size?: number; color?: string }) {
  return (
    <>
      <style>{spinStyle}</style>
      <div
        style={{
          width: size, height: size,
          borderRadius: '50%',
          border: '3px solid rgba(0,0,0,0.08)',
          borderTopColor: color,
          animation: '_tapory_spin 0.7s linear infinite',
          flexShrink: 0,
        }}
      />
    </>
  );
}

function LoadingScreen() {
  return (
    <div style={fullscreenCenter}>
      <Spinner />
      <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>Đang tải…</p>
    </div>
  );
}

function NoContentScreen({ cardId }: { cardId: string }) {
  return (
    <div style={{ ...fullscreenCenter, gap: 16, padding: '0 32px', textAlign: 'center' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0, lineHeight: 1.3 }}>
          Thẻ chưa có nội dung
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.6 }}>
          Thẻ NFC của bạn chưa được thiết lập.<br />
          Nhấn nút bên dưới để bắt đầu tạo trang cá nhân của bạn.
        </p>
      </div>
      <a
        href={`/edit/${cardId}`}
        style={{
          display: 'inline-block',
          marginTop: 8,
          padding: '12px 28px',
          borderRadius: 12,
          background: '#6366f1',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
        }}
      >
        Thiết lập ngay →
      </a>
      <p style={{ fontSize: 11, color: '#ccc', margin: 0 }}>Mã thẻ: {cardId}</p>
    </div>
  );
}

function RedirectingScreen({ url }: { url?: string }) {
  useEffect(() => {
    if (!url) return;
    const t = setTimeout(() => { window.location.href = url; }, 600);
    return () => clearTimeout(t);
  }, [url]);

  if (!url) {
    return (
      <div style={{ ...fullscreenCenter, gap: 12, padding: '0 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 48, lineHeight: 1 }}>🔗</span>
        <p style={{ fontSize: 14, color: '#666', margin: 0 }}>Liên kết chưa được cấu hình.</p>
      </div>
    );
  }

  return (
    <div style={{ ...fullscreenCenter, gap: 14, padding: '0 24px', textAlign: 'center' }}>
      <Spinner />
      <p style={{ fontSize: 14, color: '#555', margin: 0 }}>Đang chuyển hướng…</p>
      <a href={url} style={{ fontSize: 11, color: '#aaa', wordBreak: 'break-all', marginTop: 2 }}>
        {url}
      </a>
    </div>
  );
}

/** Stardust: bộ phim ký ức 3D chạy ở site ngoài — đưa người xem sang đó. */
function StardustLaunchScreen({ orderId }: { orderId: string }) {
  const url = env.stardustUrl ? `${env.stardustUrl}/${encodeURIComponent(orderId)}` : '';

  useEffect(() => {
    if (!url) return;
    const t = setTimeout(() => { window.location.href = url; }, 700);
    return () => clearTimeout(t);
  }, [url]);

  return (
    <div style={{
      ...fullscreenCenter, gap: 14, padding: '0 24px', textAlign: 'center',
      background: 'radial-gradient(120% 90% at 50% 30%, #1a0f2e 0%, #0b0618 60%, #060312 100%)',
    }}>
      <span style={{ fontSize: 40, lineHeight: 1 }}>🌌</span>
      {url ? (
        <>
          <Spinner color="rgba(200,140,255,0.7)" />
          <p style={{ fontSize: 14, color: '#cdb8ff', margin: 0 }}>Đang mở bộ phim ký ức…</p>
          <a href={url} style={{ fontSize: 11, color: '#8d7fa5', wordBreak: 'break-all', marginTop: 2 }}>
            {url}
          </a>
        </>
      ) : (
        <p style={{ fontSize: 13, color: '#8d7fa5', margin: 0 }}>
          Chưa cấu hình NEXT_PUBLIC_STARDUST_URL.
        </p>
      )}
    </div>
  );
}

const fullscreenCenter: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  backgroundColor: '#fff',
};

export function ViewClient({ orderId }: { orderId: string }) {
  const [scale, setScale] = useState<number | null>(null);
  const [introCompleted, setIntroCompleted] = useState(false);

  // Magnetic edit button — springs toward cursor on desktop
  const editBtnRef = useMagneticElement<HTMLAnchorElement>({ strength: 0.40, radius: 72 });

  // Touch scatter — tap card → particles burst at tap point
  const cardRef        = useRef<HTMLDivElement>(null);
  const scatterOverlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const vw = window.visualViewport?.width  ?? window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      setScale(Math.min(vw / NATIVE_W, vh / NATIVE_H));
    };
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);


  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['memorial', orderId],
    queryFn: () => MemorialAPI.getOne(orderId),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const memorial = result?.data as IMemorial | null | undefined;

  const styles      = memorial ? getTemplateStyles(memorial.templateId) : [];
  const activeStyle = styles.find(s => s.id === memorial?.styleId) ?? styles[0];
  const activeFrame = FRAMES.find(f => f.id === (memorial?.frameId  ?? 'none')) ?? FRAMES[0];
  const activeEffect = EFFECTS.find(e => e.id === (memorial?.effectId ?? 'none')) ?? EFFECTS[0];

  const introId = memorial?.introId ?? 'none';
  const hasIntro = introId && introId !== 'none';

  // Touch scatter — must be called before early returns (Rules of Hooks).
  // The hook's inner useEffect guards against missing refs, so calling it
  // before data loads is safe — it just won't attach until the card mounts.
  useTouchScatter(cardRef, scatterOverlay, {
    primary:   activeStyle?.colors.primary   ?? '#6366f1',
    secondary: activeStyle?.colors.secondary ?? '#a5b4fc',
    count: 14,
  });

  if (!scale || isLoading) return <LoadingScreen />;
  if (isError) return <NoContentScreen cardId={orderId} />;
  if (!memorial) return <NoContentScreen cardId={orderId} />;
  if (memorial.templateId === 'redirect') return <RedirectingScreen url={memorial.website} />;
  if (memorial.templateId === 'stardust') return <StardustLaunchScreen orderId={orderId} />;

  const draft: IEditDraft = { ...memorial, orderId: memorial.orderId ?? orderId, isDirty: false };
  const screenBg = getScreenBackground(draft, activeStyle);

  return (
    <>
      <style>{`#tapory-screen::-webkit-scrollbar{display:none}`}</style>

      {/* Scatter particle overlay — fixed, pointer-events:none, z:55 */}
      <div
        ref={scatterOverlay}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, overflow: 'hidden' }}
      />

      {/* Intro overlay — blocks view until user interacts */}
      {hasIntro && !introCompleted && (
        <IntroOverlay
          introId={introId}
          onComplete={() => setIntroCompleted(true)}
          primaryColor={activeStyle?.colors.primary}
          accentColor={activeStyle?.colors.accent}
          title={memorial.title}
          imageUrl={memorial.imageUrl}
        />
      )}

      {/* ── Cinematic Parallax Depth System ── */}
      <CinematicParallax
        primary={activeStyle?.colors.primary ?? '#c45c8a'}
        secondary={activeStyle?.colors.secondary ?? '#f8b4cc'}
        accent={activeStyle?.colors.accent ?? '#fdf5f8'}
        screenBg={screenBg}
      >
        {/* Card — sits on Layer 2 inside the parallax */}
        <div style={{ zoom: scale } as React.CSSProperties}>
          <div
            ref={cardRef}
            id="tapory-screen"
            style={{
              width: NATIVE_W,
              height: NATIVE_H,
              position: 'relative',
              overflowX: 'hidden',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              /* Soft drop shadow gives depth to the floating card */
              boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.18)',
              borderRadius: 2,
            } as React.CSSProperties}
          >
            {activeStyle && <TemplateRenderer data={draft} style={activeStyle} autoPlay />}

            {/* ── Texture & Material System — overlays on top of template ── */}
            <TextureMaterial
              templateId={draft.templateId}
              layout={activeStyle?.layout ?? ''}
              primary={activeStyle?.colors.primary ?? '#c45c8a'}
              secondary={activeStyle?.colors.secondary ?? '#f8b4cc'}
              accent={activeStyle?.colors.accent ?? '#fdf5f8'}
            />
          </div>
        </div>
      </CinematicParallax>

      {/* ── Dynamic Lighting System — z:45, above parallax, below frames ── */}
      <LightingOverlay
        primary={activeStyle?.colors.primary ?? '#c45c8a'}
        secondary={activeStyle?.colors.secondary ?? '#f8b4cc'}
        accent={activeStyle?.colors.accent ?? '#fdf5f8'}
      />

      {/* Frame + Effect overlays — z:50 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 50,
          overflow: 'hidden',
        }}
      >
        <EffectOverlay effect={activeEffect} />
        <FrameOverlay frame={activeFrame} />
      </div>

      {/* ── Edit button — moved to bottom:70 to clear ShareButton ── */}
      <Link
        ref={editBtnRef}
        href={`/edit/${orderId}`}
        style={{
          position: 'fixed',
          bottom: 70,
          right: 20,
          zIndex: 61,
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.6)',
          color: 'rgba(0,0,0,0.60)',
          textDecoration: 'none',
          boxShadow: '0 2px 16px rgba(0,0,0,0.22)',
          willChange: 'transform',
        } as React.CSSProperties}
        title="Chỉnh sửa"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </Link>

      {/* ── Share System — z:62 ── */}
      <ShareButton
        orderId={orderId}
        title={memorial.title}
        primary={activeStyle?.colors.primary ?? '#6366f1'}
      />

      {/* ── Music Pulse — z:44 (ring) + z:62 (controls) ── */}
      <MusicPulse primary={activeStyle?.colors.primary ?? '#c45c8a'} />
    </>
  );
}
