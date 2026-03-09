/**
 * 전표 서비스
 * 전표 관련 API 호출 로직
 */

import { apiClient } from "./api-client";
import type {
  SlipRecord,
  SlipDetail,
  CreateSlipRequest,
  UpdateSlipRequest,
  ChangeSlipStatusRequest,
  SlipSearchFilter,
  PaginatedResponse,
} from "@/types";

export const slipService = {
  // 전표 목록 조회 (페이지네이션)
  async getSlips(filter?: SlipSearchFilter): Promise<PaginatedResponse<SlipRecord>> {
    return apiClient.get<PaginatedResponse<SlipRecord>>("/slips", { 
      params: filter as any 
    });
  },

  // 전표 상세 조회
  async getSlipDetail(slipNo: string): Promise<SlipDetail> {
    return apiClient.get<SlipDetail>(`/slips/${slipNo}`);
  },

  // 전표 생성
  async createSlip(data: CreateSlipRequest): Promise<SlipDetail> {
    return apiClient.post<SlipDetail>("/slips", data);
  },

  // 전표 수정
  async updateSlip(data: UpdateSlipRequest): Promise<SlipDetail> {
    return apiClient.put<SlipDetail>(`/slips/${data.slipNo}`, data);
  },

  // 전표 삭제
  async deleteSlip(slipNo: string): Promise<void> {
    return apiClient.delete<void>(`/slips/${slipNo}`);
  },

  // 전표 상태 변경
  async changeStatus(data: ChangeSlipStatusRequest): Promise<SlipDetail> {
    return apiClient.patch<SlipDetail>(`/slips/${data.slipNo}/status`, data);
  },

  // 전표 승인
  async approveSlip(slipNo: string, note?: string): Promise<SlipDetail> {
    return this.changeStatus({ slipNo, newStatus: "A01", note });
  },

  // 전표 반려
  async rejectSlip(slipNo: string, note?: string): Promise<SlipDetail> {
    return this.changeStatus({ slipNo, newStatus: "A02", note });
  },

  // 전표 신청
  async submitSlip(slipNo: string, note?: string): Promise<SlipDetail> {
    return this.changeStatus({ slipNo, newStatus: "S01", note });
  },
};
