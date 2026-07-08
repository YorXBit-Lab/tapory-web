'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Volume2, VolumeX, RotateCcw, Link2, X } from 'lucide-react';
import type { IEditDraft } from '@/configs/types';
import { Stage } from './engine/stage';
import type { DirectorState } from './engine/director';
import { experience } from './experience';
import { applyDraftContent } from './content';
import './stardust.css';

const IDLE_STATE: DirectorState = {
  scene: 'intro', index: 0, started: false, loaded: false, transitioning: false, duration: 0,
};

interface Props {
  data: IEditDraft;
  /** Có mặt = hiển thị nút thoát (dùng cho chế độ xem thử trong editor). */
  onExit?: () => void;
  /**
   * Chạy nhúng trong một khung chứa (preview editor) thay vì fullscreen:
   * engine size theo host, tắt phím tắt toàn cục, tự dựng lại khi nội dung đổi.
   */
  embedded?: boolean;
}

/**
 * Bộ phim ký ức 3D — port từ project stardust-memory, chạy client-only
 * (import qua next/dynamic với ssr: false). Nội dung thẻ được áp vào config
 * engine TRƯỚC khi Stage khởi tạo; unmount sẽ hủy Stage để lần mở sau
 * dựng lại với nội dung mới.
 */
export default function StardustExperience({ data, onExit, embedded }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [copied, setCopied] = useState(false);
  const tap = useRef({ x: 0, y: 0, t: 0 });

  // engine đọc nội dung một lần lúc khởi tạo — khi nội dung đổi (gõ trong
  // editor) thì dựng lại cả stage, debounce để không rebuild theo từng phím
  const dataRef = useRef(data);
  dataRef.current = data;
  const signature = JSON.stringify([
    data.title, data.mainGreeting, data.bigWish, data.description, data.finalMessage, data.photoUrls,
  ]);
  const lastSignature = useRef(signature);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (signature === lastSignature.current) return;
    const t = setTimeout(() => {
      lastSignature.current = signature;
      setEpoch(n => n + 1);
    }, 800);
    return () => clearTimeout(t);
  }, [signature]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    applyDraftContent(dataRef.current);
    const s = Stage.get();
    s.attach(element);
    setStage(s);
    return () => {
      s.detach(element);
      Stage.destroy();
      setStage(null);
    };
  }, [epoch]);

  const subscribe = useCallback(
    (cb: () => void) => (stage ? stage.director.onChange(cb) : () => undefined),
    [stage],
  );
  const state = useSyncExternalStore(subscribe, () => stage?.director.state ?? IDLE_STATE, () => IDLE_STATE);

  useEffect(() => {
    // nhúng trong editor: không cướp phím của form nhập liệu
    if (!stage || embedded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        if (document.activeElement instanceof HTMLButtonElement) return;
        if (state.started && state.scene !== 'final') { e.preventDefault(); stage.director.advance(); }
      } else if (e.key === 'm' || e.key === 'M') stage.director.toggleSound();
      else if ((e.key === 'r' || e.key === 'R') && state.scene === 'final') stage.director.replay();
      else if (e.key === 'Escape' && onExit) onExit();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [stage, state.started, state.scene, onExit, embedded]);

  const onPointerDown = (e: React.PointerEvent) => { tap.current = { x: e.clientX, y: e.clientY, t: performance.now() }; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!stage) return;
    const { x, y, t } = tap.current;
    const moved = Math.hypot(e.clientX - x, e.clientY - y);
    if (moved < 8 && performance.now() - t < 350 && state.started) {
      // mỗi cú chạm nở một chùm stardust; chạm vào ảnh thì ảnh nhún thay vì chuyển cảnh
      const hitCard = stage.tapInteract(e.clientX, e.clientY);
      if (!hitCard && experience.controls.tapToAdvance && !state.transitioning && state.scene !== 'final') {
        stage.director.advance();
      }
    }
  };

  const copyLink = async () => {
    try { await navigator.clipboard?.writeText(location.href); } catch { /* clipboard không khả dụng qua http */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const muted = stage?.audio.muted ?? false;

  return (
    <main className={`sd-app scene-${state.scene}${embedded ? ' sd-embedded' : ''}`}>
      <div ref={host} className="sd-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} />

      {/* cinema letterbox */}
      <div className="sd-cine-bar top" aria-hidden="true" />
      <div className="sd-cine-bar bottom" aria-hidden="true" />

      {!state.started && (
        <section className="sd-overlay">
          <header className="sd-film-poster">
            <p className="sd-film-eyebrow">✦ &ensp;a light film for {experience.recipientName}&ensp; ✦</p>
            <h1 className="sd-film-title">{experience.copy.title}</h1>
            <p className="sd-film-sub">{experience.copy.subtitle}</p>
          </header>
          <button
            className="sd-start-orb"
            onClick={() => stage?.director.begin()}
            disabled={!state.loaded}
            aria-label={experience.copy.start}
          >
            <i /><i className="inner" />
            <span>{state.loaded ? experience.copy.start : experience.copy.loading}</span>
          </button>
          <p className="sd-start-hint">{experience.copy.startHint}</p>
        </section>
      )}

      {onExit && (
        <button className="sd-ghost exit" onClick={onExit} aria-label="Đóng bộ phim">
          <X />
        </button>
      )}

      {stage?.audio.available && (
        <button className="sd-ghost sound" onClick={() => stage.director.toggleSound()} aria-label={muted ? experience.copy.soundOn : experience.copy.soundOff}>
          {muted ? <VolumeX /> : <Volume2 />}
        </button>
      )}

      {state.scene === 'final' && (
        <div className="sd-final-actions">
          <button onClick={() => stage?.director.replay()}><RotateCcw /> {experience.copy.replay}</button>
          {!onExit && <button onClick={copyLink}><Link2 /> {experience.copy.copyLink}</button>}
        </div>
      )}

      <div className={`sd-copied-toast ${copied ? 'show' : ''}`} role="status">{experience.copy.copied}</div>
    </main>
  );
}
