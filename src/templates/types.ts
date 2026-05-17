import type { IEditDraft, ITemplateStyle, TemplateId } from '@/configs/types';
import type React from 'react';

export interface LayoutColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface LayoutProps {
  data: IEditDraft;
  c: LayoutColors;
  /** True on the view page — layouts may use this to auto-start playback. */
  autoPlay?: boolean;
}

export type FieldType = 'image' | 'text' | 'textarea' | 'date' | 'url';

export interface FieldMeta {
  key: keyof IEditDraft;
  label: string;
  placeholder: string;
  type: FieldType;
}

export interface TemplateModule {
  id: TemplateId;
  styles: ITemplateStyle[];
  fields: FieldMeta[];
  layouts: Record<string, React.ComponentType<LayoutProps>>;
  frameIds?: string[];
  imageModes?: string[];
}
