import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type CrudService = {
  getAll?: (params?: any) => Promise<any>;
  getOne?: (id: string) => Promise<any>;
  createOne?: (data: any) => Promise<any>;
  updateOne?: (id: string, data: any) => Promise<any>;
  deleteOne?: (id: string) => Promise<any>;
};

export const useFetchList = (queryKey: any[], service: CrudService, params?: any) =>
  useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => service.getAll!(params),
    enabled: !!service.getAll,
  });

export const useFetchOne = (
  queryKey: any[],
  service: CrudService,
  options?: { enabled?: boolean },
  id?: string,
) =>
  useQuery({
    queryKey,
    queryFn: () => service.getOne!(id!),
    enabled: options?.enabled !== false && !!id,
  });

export const useCreateItem = (
  queryKey: any[],
  service: CrudService,
  _successMsg = 'Tạo thành công!',
  _errorMsg = 'Tạo thất bại!',
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => service.createOne!(data),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
};

export const useUpdateItem = (queryKey: any[], service: CrudService) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => service.updateOne!(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
};

export const useDeleteItem = (queryKey: any[], service: CrudService) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.deleteOne!(id),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
};
