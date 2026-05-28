'use client';
import { useState, useCallback, useRef } from 'react';

/**
 * ─── TIKTOK / VIRAL SHARE SYSTEM ─────────────────────────────────────────────
 *
 * Actions:
 *  • Copy link    — navigator.clipboard.writeText()
 *  • Native share — navigator.share() (iOS/Android) with URL + title
 *  • Save image   — fetch /api/og/[orderId] → download 1200×630 PNG
 *                   (server-rendered with Noto Sans, all Vietnamese chars OK)
 *
 * The panel animates in from below, spring physics, blurred glass.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CSS = `
@keyframes _sh_panel{from{opacity:0;transform:translateY(10px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes _sh_btn  {from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
`;

interface Props {
  orderId:  string;
  title?:   string;
  primary?: string;
}

export function ShareButton({ orderId, title, primary = '#6366f1' }: Props) {
  const [open,      setOpen]      = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [capturing, setCapturing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/view/${orderId}`
    : `/view/${orderId}`;

  const toggle = () => { setOpen(v => !v); setCopied(false); };

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      // Older Safari fallback
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
    }
  }, [shareUrl]);

  const shareNative = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Ký ức của tôi — Tapory',
          text:  '✨ Xem trang kỷ niệm của tôi trên Tapory',
          url:   shareUrl,
        });
      } catch { /* user cancelled — no-op */ }
    } else {
      copyLink();
    }
  }, [shareUrl, title, copyLink]);

  const captureCard = useCallback(async () => {
    setCapturing(true);
    try {
      // Fetch the server-rendered OG image (1200×630, Noto Sans, full Vietnamese)
      const res = await fetch(`/api/og/${orderId}`);
      if (!res.ok) throw new Error(`OG fetch ${res.status}`);
      const blob = await res.blob();

      // iOS Safari: use Web Share API with file if available
      if (
        typeof navigator.share === 'function' &&
        /iPhone|iPad|iPod/i.test(navigator.userAgent)
      ) {
        const file = new File([blob], `tapory-memory-${orderId}.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file] });
          return;
        }
      }

      // Standard browser download
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = `tapory-memory-${orderId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (err) {
      console.warn('[Tapory] Save image failed:', err);
    } finally {
      setCapturing(false);
    }
  }, [orderId]);

  const ITEM_STYLE: React.CSSProperties = {
    display:'flex', alignItems:'center', gap:9,
    padding:'9px 16px', borderRadius:13, border:'none', cursor:'pointer',
    background:'rgba(255,255,255,0.92)',
    backdropFilter:'blur(16px)',
    WebkitBackdropFilter:'blur(16px)',
    color:'rgba(0,0,0,0.70)',
    fontSize:12, fontWeight:600, letterSpacing:'.01em',
    boxShadow:'0 2px 16px rgba(0,0,0,0.16)',
    whiteSpace:'nowrap' as const,
    transition:'background .18s, color .18s, transform .15s',
  };

  return (
    <>
      <style>{CSS}</style>

      {/* ── Action panel ── */}
      {open && (
        <div style={{
          position:'fixed', bottom:70, right:20, zIndex:62,
          display:'flex', flexDirection:'column', gap:7, alignItems:'flex-end',
          animation:'_sh_panel .3s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {/* Copy link */}
          <button
            onClick={copyLink}
            style={{
              ...ITEM_STYLE,
              background: copied ? 'rgba(34,197,94,0.88)' : ITEM_STYLE.background,
              color:       copied ? '#fff'                  : ITEM_STYLE.color,
              animation:'_sh_btn .28s .06s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            <span style={{ fontSize:14 }}>{copied ? '✓' : '🔗'}</span>
            {copied ? 'Đã sao chép!' : 'Sao chép link'}
          </button>

          {/* Native share */}
          <button
            onClick={shareNative}
            style={{
              ...ITEM_STYLE,
              animation:'_sh_btn .28s .1s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            <span style={{ fontSize:14 }}>📤</span>
            Chia sẻ
          </button>

          {/* Save image */}
          <button
            onClick={captureCard}
            disabled={capturing}
            style={{
              ...ITEM_STYLE,
              opacity: capturing ? 0.6 : 1,
              cursor:  capturing ? 'not-allowed' : 'pointer',
              animation:'_sh_btn .28s .14s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            <span style={{ fontSize:14 }}>📷</span>
            {capturing ? 'Đang lưu…' : 'Lưu ảnh đẹp'}
          </button>
        </div>
      )}

      {/* ── Share toggle button ── */}
      <button
        onClick={toggle}
        aria-label="Chia sẻ"
        style={{
          position:'fixed', bottom:20, right:20, zIndex:62,
          width:40, height:40, borderRadius:'50%', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          background: open ? `${primary}ee` : 'rgba(255,255,255,0.90)',
          backdropFilter:'blur(12px)',
          WebkitBackdropFilter:'blur(12px)',
          border: open ? 'none' : '1px solid rgba(255,255,255,0.60)',
          boxShadow:'0 2px 16px rgba(0,0,0,0.22)',
          transition:'background .22s, border .22s',
        } as React.CSSProperties}
      >
        {open ? (
          // Close X
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          // Share icon
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5"  r="3"/>
            <circle cx="6"  cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        )}
      </button>
    </>
  );
}
