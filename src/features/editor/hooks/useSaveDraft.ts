import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch, RootState } from '@/redux/store';
import { markSaved } from '@/redux/editSlice';
import { MemorialAPI } from '@/services/MemorialAPI';
import { CardAPI } from '@/services/CardAPI';
import { useCardAuthCtx } from '@/features/auth/CardAuthContext';

export function useSaveDraft() {
  const dispatch = useDispatch<AppDispatch>();
  const draft = useSelector((s: RootState) => s.edit);
  const { requireAuth } = useCardAuthCtx();

  const handleSave = () => {
    const { isDirty, ...memorial } = draft;
    requireAuth(async () => {
      try {
        await MemorialAPI.upsert(memorial);
        CardAPI.markPublished(draft.orderId, draft.templateId).catch(() => {});
        dispatch(markSaved());
        toast.success('Đã lưu thành công');
      } catch (err) {
        console.error('[useSaveDraft]', err);
        toast.error('Lưu thất bại, vui lòng thử lại');
      }
    });
  };

  return { handleSave, isDirty: draft.isDirty };
}
