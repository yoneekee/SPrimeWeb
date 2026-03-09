/**
 * 품목 마스터 React Query 훅
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { itemService } from "@/services";
import type { Item, ItemRequest, MasterSearchFilter, PaginatedResponse } from "@/types";

// Query keys
export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  list: (filter?: MasterSearchFilter) => [...itemKeys.lists(), filter] as const,
  details: () => [...itemKeys.all, "detail"] as const,
  detail: (id: number) => [...itemKeys.details(), id] as const,
  detailByCode: (code: string) => [...itemKeys.details(), "code", code] as const,
  stock: (code: string) => [...itemKeys.all, "stock", code] as const,
};

// 품목 목록 조회
export const useItems = (
  filter?: MasterSearchFilter,
  options?: UseQueryOptions<PaginatedResponse<Item>>
) => {
  return useQuery({
    queryKey: itemKeys.list(filter),
    queryFn: () => itemService.getAll(filter),
    ...options,
  });
};

// 품목 상세 조회 (ID)
export const useItem = (
  id: number,
  options?: UseQueryOptions<Item>
) => {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: () => itemService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// 품목 상세 조회 (코드)
export const useItemByCode = (
  code: string,
  options?: UseQueryOptions<Item>
) => {
  return useQuery({
    queryKey: itemKeys.detailByCode(code),
    queryFn: () => itemService.getByCode(code),
    enabled: !!code,
    ...options,
  });
};

// 품목 재고 조회
export const useItemStock = (
  code: string,
  options?: UseQueryOptions<{ itemCode: string; quantity: number; warehouse: string }[]>
) => {
  return useQuery({
    queryKey: itemKeys.stock(code),
    queryFn: () => itemService.getStock(code),
    enabled: !!code,
    ...options,
  });
};

// 품목 생성
export const useCreateItem = (
  options?: UseMutationOptions<Item, Error, ItemRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ItemRequest) => itemService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
    ...options,
  });
};

// 품목 수정
export const useUpdateItem = (
  options?: UseMutationOptions<Item, Error, { id: number; data: ItemRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => itemService.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: itemKeys.detailByCode(data.code) });
    },
    ...options,
  });
};

// 품목 삭제
export const useDeleteItem = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => itemService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.removeQueries({ queryKey: itemKeys.detail(id) });
    },
    ...options,
  });
};
