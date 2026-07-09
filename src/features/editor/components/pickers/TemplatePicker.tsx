'use client';

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import type { TemplateId } from '@/configs/types';
import { PUBLIC_TEMPLATE_LIST } from '@/configs/constants';
import { setTemplate, setStyle } from '@/redux/editSlice';
import { getTemplateStyles } from '@/templates/registry';
import { HScrollRow } from './HScrollRow';

export function TemplatePicker() {
  const dispatch = useDispatch<AppDispatch>();
  const activeId = useSelector((s: RootState) => s.edit.templateId);

  const handleSwitch = (id: TemplateId) => {
    if (id === activeId) return;
    dispatch(setTemplate(id));
    // Keep content fields (title, description, etc.) — only reset style to first of new template
    const styles = getTemplateStyles(id);
    if (styles[0]) dispatch(setStyle(styles[0].id));
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-content3">Loại template</p>
      <HScrollRow className="flex gap-2 pb-1">
        {PUBLIC_TEMPLATE_LIST.map((tpl) => {
          const active = tpl.id === activeId;
          return (
            <button
              key={tpl.id}
              onClick={() => handleSwitch(tpl.id)}
              className={[
                'flex flex-shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-center transition-colors',
                active
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-100 text-content2 hover:border-gray-200 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className="text-base leading-none">{tpl.icon}</span>
              <span className="mt-1 text-[10px] font-medium leading-none">{tpl.name}</span>
            </button>
          );
        })}
      </HScrollRow>
    </div>
  );
}
