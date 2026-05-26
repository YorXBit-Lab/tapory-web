import { useDispatch, useSelector } from 'react-redux';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import type { AppDispatch, RootState } from '@/redux/store';
import { markSaved } from '@/redux/editSlice';
import { MemorialAPI } from '@/services/MemorialAPI';
import { CardAPI } from '@/services/CardAPI';
import { auth } from '@/libs/firebase';
import { clearSession } from '@/features/auth/utils';
import { useCardAuthCtx } from '@/features/auth/CardAuthContext';

export function useSaveDraft(callbacks?: { onSaved?: (imageUrl: string) => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const draft = useSelector((s: RootState) => s.edit);
  const { requireAuth, isReady } = useCardAuthCtx();

  const handleSave = () => {
    if (!isReady) {
      toast.error('Đang xác thực, vui lòng thử lại sau giây lát');
      return;
    }

    const { isDirty, ...memorial } = draft;
    requireAuth(async () => {
      try {
        await MemorialAPI.upsert(memorial);
        CardAPI.markPublished(draft.orderId, draft.templateId).catch(() => {});
        dispatch(markSaved());
        callbacks?.onSaved?.(draft.imageUrl ?? '');
        toast.success('Đã lưu thành công');
      } catch (err) {
        console.error('[useSaveDraft]', err);
        toast.error('Lưu thất bại, vui lòng thử lại');
      } finally {
        // Sign out after each save so next save always requires password
        signOut(auth).catch(() => {});
        clearSession(draft.orderId);
      }
    });
  };

  return { handleSave, isDirty: draft.isDirty };
}
