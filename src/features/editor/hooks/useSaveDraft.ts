import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import { markSaved } from '@/redux/editSlice';
import { MemorialAPI } from '@/services/MemorialAPI';

export function useSaveDraft() {
  const dispatch = useDispatch<AppDispatch>();
  const draft = useSelector((s: RootState) => s.edit);

  const handleSave = async () => {
    const { isDirty, ...memorial } = draft;
    try {
      await MemorialAPI.updateOne(draft.orderId, memorial);
      dispatch(markSaved());
    } catch {}
  };

  return { handleSave, isDirty: draft.isDirty };
}
