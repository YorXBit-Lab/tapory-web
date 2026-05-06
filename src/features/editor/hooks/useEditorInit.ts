import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import type { TemplateId } from '@/configs/types';
import { setOrderId, setTemplate, setStyle, updateField } from '@/redux/editSlice';
import { getTemplateStyles } from '@/templates/registry';
import { TEMPLATE_DEFAULTS } from '@/templates/defaults';

export function useEditorInit(orderId: string, initialTemplate: TemplateId) {
  const dispatch = useDispatch<AppDispatch>();
  const currentOrderId  = useSelector((s: RootState) => s.edit.orderId);
  const currentTemplate = useSelector((s: RootState) => s.edit.templateId);

  useEffect(() => {
    if (currentOrderId !== orderId || currentTemplate !== initialTemplate) {
      dispatch(setOrderId(orderId));
      dispatch(setTemplate(initialTemplate));
      dispatch(updateField(TEMPLATE_DEFAULTS[initialTemplate]));
      const styles = getTemplateStyles(initialTemplate);
      if (styles[0]) dispatch(setStyle(styles[0].id));
    }
  }, [orderId, initialTemplate, currentOrderId, currentTemplate, dispatch]);
}
