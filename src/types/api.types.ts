/**
 * API 공통 응답 타입
 * C# 백엔드의 표준 응답 구조와 매핑
 */

// 표준 API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API 에러
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// 인증 관련
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    name: string;
    email: string;
    department: string;
    role: string;
  };
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
