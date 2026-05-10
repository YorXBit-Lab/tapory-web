import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import type { TemplateId } from '@/configs/types';
import { setOrderId, setTemplate, setStyle, updateField, markSaved } from '@/redux/editSlice';
import { getTemplateStyles } from '@/templates/registry';
import { TEMPLATE_DEFAULTS } from '@/templates/defaults';
import { MemorialAPI } from '@/services/MemorialAPI';
import { CardAPI } from '@/services/CardAPI';

export function useEditorInit(orderId: string, initialTemplate: TemplateId) {
  const dispatch = useDispatch<AppDispatch>();
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedRef.current === orderId) return;
    loadedRef.current = orderId;

    dispatch(setOrderId(orderId));

    MemorialAPI.getOne(orderId).then(async ({ data }) => {
      if (data) {
        const memorial = data as Record<string, unknown>;
        const tpl = (memorial.templateId as TemplateId) ?? initialTemplate;
        dispatch(setTemplate(tpl));
        dispatch(updateField(memorial as Parameters<typeof updateField>[0]));
        const styles = getTemplateStyles(tpl);
        if (styles[0]) dispatch(setStyle((memorial.styleId as string) ?? styles[0].id));
        dispatch(markSaved());
      } else {
        // No memorial yet — use card's stored templateId as fallback, then URL param
        const card = await CardAPI.getOne(orderId).catch(() => null);
        const tpl: TemplateId = card?.templateId ?? initialTemplate;
        dispatch(setTemplate(tpl));
        dispatch(updateField(TEMPLATE_DEFAULTS[tpl]));
        const styles = getTemplateStyles(tpl);
        if (styles[0]) dispatch(setStyle(styles[0].id));
      }
    }).catch(async () => {
      const card = await CardAPI.getOne(orderId).catch(() => null);
      const tpl: TemplateId = card?.templateId ?? initialTemplate;
      dispatch(setTemplate(tpl));
      dispatch(updateField(TEMPLATE_DEFAULTS[tpl]));
      const styles = getTemplateStyles(tpl);
      if (styles[0]) dispatch(setStyle(styles[0].id));
    });
  }, [orderId, initialTemplate, dispatch]);
}
