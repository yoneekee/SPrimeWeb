/**
 * 창고 마스터 React Query 훅
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { warehouseService } from "@/services";
import type { Warehouse, WarehouseRequest, MasterSearchFilter, PaginatedResponse } from "@/types";

// Query keys
export const warehouseKeys = {
  all: ["warehouses"] as const,
  lists: () => [...warehouseKeys.all, "list"] as const,
  list: (filter?: MasterSearchFilter) => [...warehouseKeys.lists(), filter] as const,
  details: () => [...warehouseKeys.all, "detail"] as const,
  detail: (id: number) => [...warehouseKeys.details(), id] as const,
};

// 창고 목록 조회
export const useWarehouses = (
  filter?: MasterSearchFilter,
  options?: UseQueryOptions<PaginatedResponse<Warehouse>>
) => {
  return useQuery({
    queryKey: warehouseKeys.list(filter),
    queryFn: () => warehouseService.getAll(filter),
    ...options,
  });
};

// 창고 상세 조회
export const useWarehouse = (
  id: number,
  options?: UseQueryOptions<Warehouse>
) => {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: () => warehouseService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// 창고 생성
export const useCreateWarehouse = (
  options?: UseMutationOptions<Warehouse, Error, WarehouseRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WarehouseRequest) => warehouseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
    ...options,
  });
};

// 창고 수정
export const useUpdateWarehouse = (
  options?: UseMutationOptions<Warehouse, Error, { id: number; data: WarehouseRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => warehouseService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
    },
    ...options,
  });
};

// 창고 삭제
export const useDeleteWarehouse = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => warehouseService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.removeQueries({ queryKey: warehouseKeys.detail(id) });
    },
    ...options,
  });
};
