import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PresetPhotoAPI } from '@/services/PresetPhotoAPI';

export const usePresetPhotos = (productId: string | undefined) =>
  useQuery({
    queryKey: ['preset_photos', productId],
    queryFn: () => PresetPhotoAPI.getByProduct(productId!),
    enabled: !!productId,
    staleTime: 60_000,
  });

export const useAllPresetPhotos = (enabled = true) =>
  useQuery({
    queryKey: ['preset_photos'],
    queryFn: () => PresetPhotoAPI.getAll(),
    enabled,
    staleTime: 60_000,
  });

export const useCreatePresetPhoto = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof PresetPhotoAPI.createOne>[0]) =>
      PresetPhotoAPI.createOne(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preset_photos', productId] });
      qc.invalidateQueries({ queryKey: ['preset_photos'] });
    },
  });
};

export const useDeletePresetPhoto = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PresetPhotoAPI.deleteOne(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preset_photos', productId] });
      qc.invalidateQueries({ queryKey: ['preset_photos'] });
    },
  });
};
