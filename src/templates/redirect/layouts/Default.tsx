'use client';
import { useState, useEffect } from 'react';
import type { LayoutProps } from '@/templates/types';

function getHostname(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}
function getFavicon(url: string) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; } catch { return null; }
}

export function RedirectDefault({ data, c }: LayoutProps) {
  const url = data.website?.trim() || '';
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [faviconOk, setFaviconOk] = useState(true);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(false);
    setFaviconOk(true);
  }, [url]);

  /* ── KHÔNG CÓ URL ── */
  if (!url) {
    return (
      <div className="relative flex min-h-full w-full flex-col items-center justify-center gap-4 px-6"
        style={{ background: `linear-gradient(160deg, ${c.accent} 0%, #f8fafc 100%)` }}>
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${c.secondary}20, transparent 70%)`, filter: 'blur(28px)' }} />
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
          style={{ background: `linear-gradient(135deg, ${c.secondary}cc, ${c.primary}cc)`,
            boxShadow: `0 8px 24px ${c.secondary}30` }}>
          🔗
        </div>
        <div className="relative z-10 flex flex-col items-center gap-1 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-35" style={{ color: c.primary }}>
            Chuyển hướng
          </p>
          <p className="mt-1 text-[7.5px] leading-relaxed opacity-40" style={{ color: c.primary }}>
            Nhập URL để xem trước
          </p>
        </div>
      </div>
    );
  }

  const hostname   = getHostname(url);
  const favicon    = getFavicon(url);
  const proxyUrl   = `/api/proxy?url=${encodeURIComponent(url)}`;

  return (
    <div className="relative flex h-full w-full flex-col bg-white">

      {/* Thanh địa chỉ mini */}
      <div className="flex flex-shrink-0 items-center gap-1.5 px-2 py-1.5"
        style={{ background: '#f1f3f4', borderBottom: '1px solid #e0e0e0' }}>
        <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: '#34a853' }} />
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded px-2 py-0.5"
          style={{ background: '#fff', border: '1px solid #dadce0' }}>
          {favicon && faviconOk
            ? <img src={favicon} className="h-3 w-3 flex-shrink-0 object-contain" alt=""
                onError={() => setFaviconOk(false)} />
            : <span style={{ fontSize: 7, flexShrink: 0 }}>🔒</span>}
          <span className="truncate" style={{ fontSize: 7, color: '#202124' }}>{hostname}</span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded"
          style={{ background: '#e8f0fe', textDecoration: 'none', fontSize: 9, color: '#1a73e8' }}>↗</a>
      </div>

      {/* Loading spinner */}
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white"
          style={{ top: 32 }}>
          <style>{`@keyframes _sp{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          <div style={{ width: 20, height: 20, borderRadius: '50%',
            border: `2px solid ${c.primary}22`, borderTopColor: c.primary,
            animation: '_sp .7s linear infinite' }} />
          <p style={{ fontSize: 8, color: c.primary, opacity: .6 }}>Đang tải {hostname}…</p>
        </div>
      )}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6"
          style={{ top: 32, background: `linear-gradient(160deg, ${c.accent}88 0%, #f0f4ff 100%)` }}>
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${c.secondary}22, ${c.primary}18)`,
              boxShadow: `0 8px 24px ${c.secondary}25`, border: '1px solid rgba(255,255,255,0.8)' }}>
            {favicon && faviconOk
              ? <img src={favicon} className="h-full w-full object-contain p-2" alt=""
                  onError={() => setFaviconOk(false)} />
              : <span className="text-2xl">🌐</span>}
          </div>
          <p className="text-center text-[11px] font-bold" style={{ color: c.primary }}>{hostname}</p>
          <p className="max-w-[180px] truncate text-center text-[7px] opacity-50" style={{ color: c.primary }}>{url}</p>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1.5 rounded-xl px-5 py-2 text-[8px] font-bold"
            style={{ background: `linear-gradient(135deg, ${c.secondary}, ${c.primary})`,
              color: '#fff', textDecoration: 'none', boxShadow: `0 4px 14px ${c.secondary}40` }}>
            ↗ Mở {hostname}
          </a>
        </div>
      )}

      {/* Iframe qua proxy — không sandbox để JS chạy đầy đủ như browser thật */}
      <iframe
        key={url}
        src={proxyUrl}
        className="min-h-0 w-full flex-1 border-0"
        style={{ display: 'block' }}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
      />
    </div>
  );
}
