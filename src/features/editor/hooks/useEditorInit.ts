import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import type { TemplateId } from '@/configs/types';
import { setOrderId, setTemplate, setStyle, updateField, markSaved } from '@/redux/editSlice';
import { getTemplateStyles } from '@/templates/registry';
import { TEMPLATE_DEFAULTS } from '@/templates/defaults';
import { MemorialAPI } from '@/services/MemorialAPI';

export function useEditorInit(orderId: string, initialTemplate: TemplateId) {
  const dispatch = useDispatch<AppDispatch>();
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedRef.current === orderId) return;
    loadedRef.current = orderId;

    dispatch(setOrderId(orderId));

    MemorialAPI.getOne(orderId).then(({ data }) => {
      if (data) {
        const memorial = data as Record<string, unknown>;
        const tpl = (memorial.templateId as TemplateId) ?? initialTemplate;
        dispatch(setTemplate(tpl));
        dispatch(updateField(memorial as Parameters<typeof updateField>[0]));
        const styles = getTemplateStyles(tpl);
        if (styles[0]) dispatch(setStyle((memorial.styleId as string) ?? styles[0].id));
        dispatch(markSaved());
      } else {
        dispatch(setTemplate(initialTemplate));
        dispatch(updateField(TEMPLATE_DEFAULTS[initialTemplate]));
        const styles = getTemplateStyles(initialTemplate);
        if (styles[0]) dispatch(setStyle(styles[0].id));
      }
    }).catch(() => {
      dispatch(setTemplate(initialTemplate));
      dispatch(updateField(TEMPLATE_DEFAULTS[initialTemplate]));
      const styles = getTemplateStyles(initialTemplate);
      if (styles[0]) dispatch(setStyle(styles[0].id));
    });
  }, [orderId, initialTemplate, dispatch]);
}
