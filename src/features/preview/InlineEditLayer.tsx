'use client';

import { useEffect, useRef } from 'react';
import { updateField } from '@/redux/editSlice';
import type { AppDispatch } from '@/redux/store';
import type { IEditDraft } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';
import { fmt } from '@/shared/utils/fmt';

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>;
  draft: IEditDraft;
  fields: FieldMeta[];
  dispatch: AppDispatch;
}

/* ── DOM helpers ──────────────────────────────────────────── */

function findTextEl(container: HTMLElement, value: string): HTMLElement | null {
  const search = value.trim().substring(0, 22);
  if (!search) return null;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = (walker.currentNode.textContent || '').trim();
    if (t === value.trim() || t.startsWith(search)) {
      const parent = walker.currentNode.parentElement;
      if (parent && parent !== container) return parent;
    }
  }
  return null;
}

function findImageEl(container: HTMLElement, imageUrl: string): HTMLElement | null {
  if (imageUrl) {
    const img = container.querySelector(`img[src="${imageUrl}"]`) as HTMLElement | null;
    if (img) return img;
  }
  // Fallback: first <img> in container
  const anyImg = container.querySelector('img') as HTMLElement | null;
  if (anyImg) return anyImg;
  // No image set yet — find emoji placeholder
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode.textContent || '';
    if (t.includes('📷')) return walker.currentNode.parentElement;
  }
  return null;
}

/* ── Component ────────────────────────────────────────────── */

export function InlineEditLayer({ containerRef, draft, fields, dispatch }: Props) {
  const isEditingRef = useRef(false);
  const draftRef = useRef(draft);
  const dispatchRef = useRef(dispatch);
  const fieldsRef = useRef(fields);
  draftRef.current = draft;
  dispatchRef.current = dispatch;
  fieldsRef.current = fields;

  /* Stamp data-tap on matching elements after every render */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isEditingRef.current) return;

    container.querySelectorAll('[data-tap]').forEach(el => {
      el.removeAttribute('data-tap');
      (el as HTMLElement).style.cursor = '';
    });

    for (const field of fields) {
      let el: HTMLElement | null = null;

      if (field.type === 'text' || field.type === 'textarea') {
        const value = (draft[field.key as keyof IEditDraft] as string | undefined) ?? '';
        if (!value.trim()) continue;
        el = findTextEl(container, value);

      } else if (field.type === 'image') {
        el = findImageEl(container, (draft.imageUrl as string) ?? '');

      } else if (field.type === 'date') {
        const formatted = fmt(draft.date ?? '');
        if (!formatted) continue;
        el = findTextEl(container, formatted);
      }

      if (el && !el.getAttribute('data-tap')) {
        el.setAttribute('data-tap', field.key);
        el.style.cursor = field.type === 'text' || field.type === 'textarea' ? 'text' : 'pointer';
      }
    }
  });

  /* Click listener on container */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tagged = target.closest('[data-tap]') as HTMLElement | null;
      if (!tagged) return;

      const fieldKey = tagged.getAttribute('data-tap') as keyof IEditDraft;
      const meta = fieldsRef.current.find(f => f.key === fieldKey);
      if (!meta) return;

      e.stopPropagation();

      /* ── Image ── */
      if (meta.type === 'image') {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        fileInput.onchange = () => {
          const file = fileInput.files?.[0];
          document.body.removeChild(fileInput);
          if (!file) return;
          const url = URL.createObjectURL(file);
          dispatchRef.current(updateField({ imageUrl: url }));
        };
        // clean up if user cancels without selecting
        fileInput.addEventListener('cancel', () => {
          if (document.body.contains(fileInput)) document.body.removeChild(fileInput);
        });
        fileInput.click();
        return;
      }

      /* ── Date ── */
      if (meta.type === 'date') {
        const rect = tagged.getBoundingClientRect();
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = (draftRef.current.date as string) || '';
        Object.assign(dateInput.style, {
          position: 'fixed',
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${Math.max(rect.width, 1)}px`,
          height: `${Math.max(rect.height, 1)}px`,
          opacity: '0',
          zIndex: '9999',
        });
        document.body.appendChild(dateInput);

        const cleanup = () => {
          if (document.body.contains(dateInput)) document.body.removeChild(dateInput);
        };
        dateInput.addEventListener('change', () => {
          dispatchRef.current(updateField({ date: dateInput.value }));
          cleanup();
        });
        dateInput.addEventListener('blur', cleanup);
        dateInput.focus();
        try { (dateInput as HTMLInputElement & { showPicker(): void }).showPicker(); } catch { /* no-op */ }
        return;
      }

      /* ── Text / Textarea ── */
      if (tagged.contentEditable === 'true') return;
      isEditingRef.current = true;

      tagged.contentEditable = 'true';
      tagged.spellcheck = false;
      tagged.style.outline = '2px solid rgba(99,102,241,0.55)';
      tagged.style.outlineOffset = '3px';
      tagged.style.borderRadius = '3px';

      tagged.focus();
      const range = document.createRange();
      range.selectNodeContents(tagged);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      const isSingleLine = meta.type === 'text';

      const onKeyDown = (ke: KeyboardEvent) => {
        if (isSingleLine && ke.key === 'Enter') { ke.preventDefault(); tagged.blur(); }
        if (ke.key === 'Escape') {
          tagged.textContent = (draftRef.current[fieldKey] as string) ?? '';
          tagged.blur();
        }
      };

      const onBlur = () => {
        const next = tagged.textContent ?? '';
        tagged.contentEditable = 'false';
        tagged.style.outline = '';
        tagged.style.outlineOffset = '';
        tagged.style.borderRadius = '';
        isEditingRef.current = false;

        tagged.removeEventListener('keydown', onKeyDown);
        tagged.removeEventListener('blur', onBlur);

        if (next !== ((draftRef.current[fieldKey] as string) ?? '')) {
          dispatchRef.current(updateField({ [fieldKey]: next }));
        }
      };

      tagged.addEventListener('keydown', onKeyDown);
      tagged.addEventListener('blur', onBlur);
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [containerRef, fields]);

  return null;
}
