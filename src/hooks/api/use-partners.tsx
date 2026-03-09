/**
 * 거래처 마스터 React Query 훅
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { partnerService } from "@/services";
import type { Partner, PartnerRequest, MasterSearchFilter, PaginatedResponse } from "@/types";

// Query keys
export const partnerKeys = {
  all: ["partners"] as const,
  lists: () => [...partnerKeys.all, "list"] as const,
  list: (filter?: MasterSearchFilter) => [...partnerKeys.lists(), filter] as const,
  details: () => [...partnerKeys.all, "detail"] as const,
  detail: (id: number) => [...partnerKeys.details(), id] as const,
  byType: (type: "CUSTOMER" | "SUPPLIER" | "BOTH") => [...partnerKeys.all, "type", type] as const,
};

// 거래처 목록 조회
export const usePartners = (
  filter?: MasterSearchFilter,
  options?: UseQueryOptions<PaginatedResponse<Partner>>
) => {
  return useQuery({
    queryKey: partnerKeys.list(filter),
    queryFn: () => partnerService.getAll(filter),
    ...options,
  });
};

// 거래처 상세 조회
export const usePartner = (
  id: number,
  options?: UseQueryOptions<Partner>
) => {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => partnerService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// 타입별 거래처 조회
export const usePartnersByType = (
  type: "CUSTOMER" | "SUPPLIER" | "BOTH",
  options?: UseQueryOptions<Partner[]>
) => {
  return useQuery({
    queryKey: partnerKeys.byType(type),
    queryFn: () => partnerService.getByType(type),
    ...options,
  });
};

// 거래처 생성
export const useCreatePartner = (
  options?: UseMutationOptions<Partner, Error, PartnerRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PartnerRequest) => partnerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
    ...options,
  });
};

// 거래처 수정
export const useUpdatePartner = (
  options?: UseMutationOptions<Partner, Error, { id: number; data: PartnerRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => partnerService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
    ...options,
  });
};

// 거래처 삭제
export const useDeletePartner = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => partnerService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.removeQueries({ queryKey: partnerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
    ...options,
  });
};
