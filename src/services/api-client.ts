/**
 * API 클라이언트
 * C# 백엔드와 통신하는 중앙화된 HTTP 클라이언트
 */

import { ApiResponse, ApiError } from "@/types";

// 환경 변수에서 API 베이스 URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

// 에러 클래스
export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public apiError: ApiError,
    message?: string
  ) {
    super(message || apiError.message);
    this.name = "ApiClientError";
  }
}

// 요청 옵션
export interface RequestOptions extends RequestInit {
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

// API 클라이언트 클래스
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  // URL에 쿼리 파라미터 추가
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  // 인증 토큰 가져오기 (sessionStorage에서)
  private getAuthToken(): string | null {
    return sessionStorage.getItem("auth_token");
  }

  // 공통 헤더 구성
  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // 타임아웃을 지원하는 fetch
  private async fetchWithTimeout(url: string, options: RequestOptions): Promise<Response> {
    const timeout = options.timeout || this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  // 응답 처리
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    
    // JSON 응답이 아닌 경우
    if (!contentType || !contentType.includes("application/json")) {
      if (!response.ok) {
        throw new ApiClientError(
          response.status,
          {
            code: "NON_JSON_ERROR",
            message: `HTTP ${response.status}: ${response.statusText}`,
          }
        );
      }
      return response.text() as any;
    }

    const apiResponse: ApiResponse<T> = await response.json();

    // 백엔드에서 success: false로 응답한 경우
    if (!apiResponse.success) {
      throw new ApiClientError(
        response.status,
        {
          code: "API_ERROR",
          message: apiResponse.message || "Unknown error",
          details: apiResponse.errors as any,
        }
      );
    }

    // HTTP 에러 상태 코드
    if (!response.ok) {
      throw new ApiClientError(
        response.status,
        {
          code: "HTTP_ERROR",
          message: apiResponse.message || `HTTP ${response.status}`,
        }
      );
    }

    return apiResponse.data;
  }

  // GET 요청
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: "GET",
      headers: this.getHeaders(options?.headers),
    });
    return this.handleResponse<T>(response);
  }

  // POST 요청
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: "POST",
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  // PUT 요청
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: "PUT",
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  // PATCH 요청
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: "PATCH",
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  // DELETE 요청
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: "DELETE",
      headers: this.getHeaders(options?.headers),
    });
    return this.handleResponse<T>(response);
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT);

// 유틸리티: mock 모드인지 확인
export const isMockMode = (): boolean => {
  return import.meta.env.VITE_USE_MOCK_DATA === "true";
};
