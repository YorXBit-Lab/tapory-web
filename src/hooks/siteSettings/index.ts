import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingsAPI, type ISiteSettings } from '@/services/SettingsAPI';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const KEY = ['site_settings'];

export const useSiteSettings = () =>
  useQuery({ queryKey: KEY, queryFn: () => SettingsAPI.get() });

export const useUpdateSiteSettings = () => {
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  return useMutation({
    mutationFn: async (data: Partial<ISiteSettings>) => {
      if (!user) throw new Error('Bạn chưa đăng nhập');
      const idToken = await user.getIdToken();
      await SettingsAPI.update(idToken, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
