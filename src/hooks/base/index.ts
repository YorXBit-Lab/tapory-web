import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

/**
 * Factory CRUD generic dùng chung cho mọi service (Product, Component, ...).
 * Tham số đầu vào để lỏng (mỗi service có kiểu riêng) nhưng KIỂU TRẢ VỀ được
 * suy ra trực tiếp từ service → caller nhận data đã có type, không phải `any`.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFn = (...args: any[]) => Promise<unknown>;

interface CrudService {
  getAll?: AsyncFn;
  getOne?: AsyncFn;
  createOne?: AsyncFn;
  updateOne?: AsyncFn;
  deleteOne?: AsyncFn;
}

type Result<F> = F extends (...args: never[]) => Promise<infer R> ? R : never;
type Arg<F, I extends number> = F extends (...args: infer A) => unknown ? A[I] : never;

export const useFetchList = <S extends CrudService>(
  queryKey: QueryKey,
  service: S,
  params?: Arg<NonNullable<S['getAll']>, 0>,
) =>
  useQuery<Result<NonNullable<S['getAll']>>>({
    queryKey: params !== undefined ? [...queryKey, params] : queryKey,
    queryFn: () => service.getAll!(params) as Promise<Result<NonNullable<S['getAll']>>>,
    enabled: !!service.getAll,
  });

export const useFetchOne = <S extends CrudService>(
  queryKey: QueryKey,
  service: S,
  options?: { enabled?: boolean },
  id?: string,
) =>
  useQuery<Result<NonNullable<S['getOne']>>>({
    queryKey,
    queryFn: () => service.getOne!(id!) as Promise<Result<NonNullable<S['getOne']>>>,
    enabled: options?.enabled !== false && !!id,
  });

export const useCreateItem = <S extends CrudService>(queryKey: QueryKey, service: S) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Arg<NonNullable<S['createOne']>, 0>) => service.createOne!(data),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
};

export const useUpdateItem = <S extends CrudService>(queryKey: QueryKey, service: S) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Arg<NonNullable<S['updateOne']>, 1> }) =>
      service.updateOne!(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
};

export const useDeleteItem = <S extends CrudService>(queryKey: QueryKey, service: S) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.deleteOne!(id),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
};
