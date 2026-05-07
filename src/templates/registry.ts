import type { TemplateId, ITemplateStyle, IFrame } from '@/configs/types';
import type { TemplateModule, LayoutProps, FieldMeta } from './types';
import { FRAMES } from '@/configs/constants';
import type React from 'react';

const registry = new Map<TemplateId, TemplateModule>();

export function registerTemplate(module: TemplateModule): void {
  registry.set(module.id, module);
}

export function getLayout(
  templateId: TemplateId,
  layout: string,
): React.ComponentType<LayoutProps> | undefined {
  return registry.get(templateId)?.layouts[layout];
}

export function getTemplateStyles(id: TemplateId): ITemplateStyle[] {
  return registry.get(id)?.styles ?? [];
}

export function getTemplateFields(id: TemplateId): FieldMeta[] {
  return registry.get(id)?.fields ?? [];
}

export function getTemplateFrames(id: TemplateId): IFrame[] {
  const frameIds = registry.get(id)?.frameIds;
  if (!frameIds) return FRAMES;
  return FRAMES.filter(f => frameIds.includes(f.id));
}

const ALL_IMAGE_MODES = ['full', 'card', 'circle'];

export function getTemplateImageModes(id: TemplateId): string[] {
  const imageModes = registry.get(id)?.imageModes;
  if (imageModes === undefined) return ALL_IMAGE_MODES;
  return imageModes;
}
