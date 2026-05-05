import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import type { TemplateId } from '@/configs/types';
import { setOrderId, setTemplate, setStyle } from '@/redux/editSlice';
import { getTemplateStyles } from '@/templates/registry';

export function useEditorInit(orderId: string, initialTemplate: TemplateId) {
  const dispatch = useDispatch<AppDispatch>();
  const currentOrderId = useSelector((s: RootState) => s.edit.orderId);

  useEffect(() => {
    if (currentOrderId !== orderId) {
      dispatch(setOrderId(orderId));
      dispatch(setTemplate(initialTemplate));
      const styles = getTemplateStyles(initialTemplate);
      if (styles[0]) dispatch(setStyle(styles[0].id));
    }
  }, [orderId, initialTemplate, currentOrderId, dispatch]);
}
