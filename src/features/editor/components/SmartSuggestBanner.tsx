'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditorContext } from '@/features/editor/context';
import { setTemplate, setStyle } from '@/redux/editSlice';
import { useColorExtraction } from '../hooks/useColorExtraction';
import { getSmartSuggestions, type SmartSuggestion } from '../hooks/useSmartSuggest';
import type { TemplateId } from '@/configs/types';

/**
 * ─── SMART SUGGEST BANNER ─────────────────────────────────────────────────────
 *
 * Appears below the template picker when an image is present.
 * Analyses the image colour palette in the browser (zero backend) then shows
 * up to 3 template+style suggestions with one-tap apply.
 *
 * Auto-dismisses after the user applies a suggestion or manually closes it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CSS = `
@keyframes _ssg_in {from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes _ssg_pulse{0%,100%{opacity:.55}50%{opacity:1}}
`;

interface Props { imageUrl: string }

export function SmartSuggestBanner({ imageUrl }: Props) {
  const { draft, dispatch }    = useEditorContext();
  const { extract }            = useColorExtraction();
  const [suggestions, setSugg] = useState<SmartSuggestion[]>([]);
  const [loading,  setLoading] = useState(false);
  const [dismissed, setDismiss]= useState(false);
  const [applied, setApplied]  = useState<string | null>(null);
  const prevUrlRef             = useRef('');
  const timerRef               = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const analyze = useCallback(async (url: string) => {
    setLoading(true); setSugg([]); setApplied(null);
    try {
      const palette = await extract(url);
      const list    = getSmartSuggestions(palette, draft.templateId);
      setSugg(list);
    } finally {
      setLoading(false);
    }
  }, [extract, draft.templateId]);

  useEffect(() => {
    if (!imageUrl || imageUrl === prevUrlRef.current) return;
    prevUrlRef.current = imageUrl;
    setDismiss(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => analyze(imageUrl), 900);
    return () => clearTimeout(timerRef.current);
  }, [imageUrl, analyze]);

  const apply = useCallback((s: SmartSuggestion) => {
    dispatch(setTemplate(s.templateId as TemplateId));
    setTimeout(() => dispatch(setStyle(s.styleId)), 60);
    setApplied(s.styleId);
  }, [dispatch]);

  if (!imageUrl || dismissed || (!loading && suggestions.length === 0)) return null;

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        borderRadius:14,
        border:'1px solid rgba(99,102,241,0.18)',
        background:'linear-gradient(135deg,rgba(99,102,241,0.06) 0%,rgba(168,85,247,0.04) 100%)',
        padding:'12px 14px',
        animation:'_ssg_in .38s cubic-bezier(0.34,1.56,0.64,1) both',
        marginBottom:4,
      }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:14 }}>✨</span>
            <p style={{ margin:0, fontSize:11, fontWeight:700, color:'rgba(99,102,241,0.88)', letterSpacing:'.04em' }}>
              {loading ? 'Đang phân tích ảnh…' : 'AI gợi ý phong cách'}
            </p>
          </div>
          <button
            onClick={() => setDismiss(true)}
            style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 5px',
              fontSize:11, color:'rgba(0,0,0,0.28)', lineHeight:1 }}
          >✕</button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display:'flex', gap:7 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                flex:1, height:54, borderRadius:10,
                background:'rgba(99,102,241,0.08)',
                animation:`_ssg_pulse 1.1s ${i * 0.15}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        )}

        {/* Suggestion cards */}
        {!loading && suggestions.map((s, i) => {
          const isApplied = applied === s.styleId;
          return (
            <button
              key={s.styleId}
              onClick={() => apply(s)}
              style={{
                width:'100%', textAlign:'left', cursor:'pointer', border:'none',
                borderRadius:11, padding:'8px 10px',
                marginBottom: i < suggestions.length - 1 ? 6 : 0,
                display:'flex', alignItems:'center', gap:10,
                background: isApplied ? 'rgba(99,102,241,0.11)' : 'rgba(255,255,255,0.75)',
                boxShadow: isApplied
                  ? '0 0 0 1.5px rgba(99,102,241,0.45)'
                  : '0 1px 5px rgba(0,0,0,0.07)',
                transition:'all .18s',
              }}
            >
              {/* Colour swatch */}
              <div style={{
                width:34, height:34, borderRadius:9, flexShrink:0,
                background:`linear-gradient(135deg,${s.colors.primary},${s.colors.secondary})`,
                boxShadow:`0 2px 8px ${s.colors.primary}44`,
              }} />

              {/* Text */}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.76)', lineHeight:1.3 }}>
                  {s.styleName}
                </p>
                <p style={{ margin:'2px 0 0', fontSize:9.5, color:'rgba(0,0,0,0.38)', lineHeight:1.4,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {s.reason}
                </p>
              </div>

              {/* Check */}
              {isApplied && <span style={{ fontSize:13, color:'rgb(99,102,241)', flexShrink:0 }}>✓</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}
