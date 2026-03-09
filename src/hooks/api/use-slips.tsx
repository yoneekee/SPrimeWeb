/**
 * 전표 관련 React Query 훅
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { slipService } from "@/services";
import type {
  SlipRecord,
  SlipDetail,
  CreateSlipRequest,
  UpdateSlipRequest,
  ChangeSlipStatusRequest,
  SlipSearchFilter,
  PaginatedResponse,
} from "@/types";

// Query keys
export const slipKeys = {
  all: ["slips"] as const,
  lists: () => [...slipKeys.all, "list"] as const,
  list: (filter?: SlipSearchFilter) => [...slipKeys.lists(), filter] as const,
  details: () => [...slipKeys.all, "detail"] as const,
  detail: (slipNo: string) => [...slipKeys.details(), slipNo] as const,
};

// 전표 목록 조회
export const useSlips = (
  filter?: SlipSearchFilter,
  options?: UseQueryOptions<PaginatedResponse<SlipRecord>>
) => {
  return useQuery({
    queryKey: slipKeys.list(filter),
    queryFn: () => slipService.getSlips(filter),
    ...options,
  });
};

// 전표 상세 조회
export const useSlipDetail = (
  slipNo: string,
  options?: UseQueryOptions<SlipDetail>
) => {
  return useQuery({
    queryKey: slipKeys.detail(slipNo),
    queryFn: () => slipService.getSlipDetail(slipNo),
    enabled: !!slipNo,
    ...options,
  });
};

// 전표 생성
export const useCreateSlip = (
  options?: UseMutationOptions<SlipDetail, Error, CreateSlipRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSlipRequest) => slipService.createSlip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slipKeys.lists() });
    },
    ...options,
  });
};

// 전표 수정
export const useUpdateSlip = (
  options?: UseMutationOptions<SlipDetail, Error, UpdateSlipRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSlipRequest) => slipService.updateSlip(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: slipKeys.lists() });
      queryClient.invalidateQueries({ queryKey: slipKeys.detail(data.slipNo) });
    },
    ...options,
  });
};

// 전표 삭제
export const useDeleteSlip = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slipNo: string) => slipService.deleteSlip(slipNo),
    onSuccess: (_, slipNo) => {
      queryClient.invalidateQueries({ queryKey: slipKeys.lists() });
      queryClient.removeQueries({ queryKey: slipKeys.detail(slipNo) });
    },
    ...options,
  });
};

// 전표 상태 변경
export const useChangeSlipStatus = (
  options?: UseMutationOptions<SlipDetail, Error, ChangeSlipStatusRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangeSlipStatusRequest) => slipService.changeStatus(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: slipKeys.lists() });
      queryClient.invalidateQueries({ queryKey: slipKeys.detail(data.slipNo) });
    },
    ...options,
  });
};

// 전표 승인
export const useApproveSlip = (
  options?: UseMutationOptions<SlipDetail, Error, { slipNo: string; note?: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slipNo, note }) => slipService.approveSlip(slipNo, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: slipKeys.lists() });
      queryClient.invalidateQueries({ queryKey: slipKeys.detail(data.slipNo) });
    },
    ...options,
  });
};

// 전표 반려
export const useRejectSlip = (
  options?: UseMutationOptions<SlipDetail, Error, { slipNo: string; note?: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slipNo, note }) => slipService.rejectSlip(slipNo, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: slipKeys.lists() });
      queryClient.invalidateQueries({ queryKey: slipKeys.detail(data.slipNo) });
    },
    ...options,
  });
};

// 전표 신청
export const useSubmitSlip = (
  options?: UseMutationOptions<SlipDetail, Error, { slipNo: string; note?: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slipNo, note }) => slipService.submitSlip(slipNo, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: slipKeys.lists() });
      queryClient.invalidateQueries({ queryKey: slipKeys.detail(data.slipNo) });
    },
    ...options,
  });
};
