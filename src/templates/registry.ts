import type { TemplateId, ITemplateStyle } from '@/configs/types';
import type { TemplateModule, LayoutProps, FieldMeta } from './types';
import type React from 'react';

const registry = new Map<TemplateId, TemplateModule>();

export function registerTemplate(module: TemplateModule): void {
  if (registry.has(module.id)) return;
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
