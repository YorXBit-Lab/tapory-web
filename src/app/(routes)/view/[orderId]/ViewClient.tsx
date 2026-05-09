'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MemorialAPI } from '@/services/MemorialAPI';
import { CardAPI } from '@/services/CardAPI';
import { TemplateRenderer } from '@/features/preview/TemplateRenderer';
import { FrameOverlay } from '@/features/preview/FrameOverlay';
import { EffectOverlay } from '@/features/preview/EffectOverlay';
import { getScreenBackground } from '@/features/preview/screenBg';
import { getTemplateStyles } from '@/templates/registry';
import '@/templates/init';
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

function NotFoundScreen({ orderId }: { orderId: string }) {
  return (
    <div style={{ ...fullscreenCenter, gap: 10, padding: '0 24px', textAlign: 'center' }}>
      <span style={{ fontSize: 52, lineHeight: 1 }}>🔍</span>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Không tìm thấy</h1>
      <p style={{ fontSize: 13, color: '#bbb', margin: 0 }}>Mã: {orderId}</p>
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

  // Track view once on mount
  useEffect(() => {
    CardAPI.trackView(orderId).catch(() => {});
  }, [orderId]);

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

  if (!scale || isLoading) return <LoadingScreen />;
  if (!memorial || isError) return <NotFoundScreen orderId={orderId} />;
  if (memorial.templateId === 'redirect') return <RedirectingScreen url={memorial.website} />;

  const draft: IEditDraft = { ...memorial, orderId: memorial.orderId ?? orderId, isDirty: false };
  const screenBg = getScreenBackground(draft, activeStyle);

  return (
    <>
      <style>{`#tapory-screen::-webkit-scrollbar{display:none}`}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          ...screenBg,
        }}
      >
        <div style={{ zoom: scale } as React.CSSProperties}>
          <div
            id="tapory-screen"
            style={{
              width: NATIVE_W,
              height: NATIVE_H,
              position: 'relative',
              overflowX: 'hidden',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              ...screenBg,
            } as React.CSSProperties}
          >
            {activeStyle && <TemplateRenderer data={draft} style={activeStyle} />}
          </div>
        </div>
      </div>

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

      <Link
        href={`/edit/${orderId}`}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 60,
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
          transition: 'opacity 0.2s',
        }}
        title="Chỉnh sửa"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </Link>
    </>
  );
}
