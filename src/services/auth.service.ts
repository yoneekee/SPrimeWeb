/**
 * 인증 서비스
 * 로그인, 로그아웃, 토큰 갱신 등
 */

import { apiClient } from "./api-client";
import type { LoginRequest, LoginResponse, RefreshTokenRequest } from "@/types";

export const authService = {
  // 로그인
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
    
    // 토큰 저장
    if (response.token) {
      sessionStorage.setItem("auth_token", response.token);
      sessionStorage.setItem("refresh_token", response.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(response.user));
    }
    
    return response;
  },

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await apiClient.post<void>("/auth/logout");
    } finally {
      // 항상 로컬 토큰 제거
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("erp_logged_in");
    }
  },

  // 토큰 갱신
  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<LoginResponse>("/auth/refresh", {
      refreshToken,
    } as RefreshTokenRequest);

    // 새 토큰 저장
    if (response.token) {
      sessionStorage.setItem("auth_token", response.token);
      sessionStorage.setItem("refresh_token", response.refreshToken);
    }

    return response;
  },

  // 현재 사용자 정보 조회
  async getCurrentUser() {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // 토큰 유효성 검사
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem("auth_token");
  },
};
