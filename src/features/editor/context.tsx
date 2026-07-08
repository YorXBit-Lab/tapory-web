'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import type { IEditDraft, ITemplateStyle, IFrame, IEffect, ITemplate } from '@/configs/types';
import type { FieldMeta } from '@/templates/types';
import { TEMPLATES, FRAMES, EFFECTS } from '@/configs/constants';
import { getTemplateStyles, getTemplateFields } from '@/templates/registry';
import '@/templates/init';

interface EditorContextValue {
  /** Route orderId — the reliable source of truth (draft.orderId is set async
   *  via redux-persist + useEditorInit and may be stale/empty on first render). */
  orderId: string;
  draft: IEditDraft;
  tpl: ITemplate;
  activeStyle: ITemplateStyle | undefined;
  activeFrame: IFrame;
  activeEffect: IEffect;
  fields: FieldMeta[];
  dispatch: AppDispatch;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ orderId, children }: { orderId: string; children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const draft = useSelector((s: RootState) => s.edit);

  const tpl = TEMPLATES[draft.templateId];
  const styles = getTemplateStyles(draft.templateId);
  const activeStyle = styles.find(s => s.id === draft.styleId) ?? styles[0];
  const activeFrame = FRAMES.find(f => f.id === draft.frameId) ?? FRAMES[0];
  const activeEffect = EFFECTS.find(e => e.id === draft.effectId) ?? EFFECTS[0];
  const fields = getTemplateFields(draft.templateId);

  return (
    <EditorContext.Provider value={{ orderId, draft, tpl, activeStyle, activeFrame, activeEffect, fields, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditorContext must be used within EditorProvider');
  return ctx;
}
