/**
 * 마스터 데이터 관련 타입 정의
 * C# 백엔드 DTO와 매핑되는 TypeScript 인터페이스
 */

// 사원 마스터
export interface Employee {
  id: number;
  code: string;
  name: string;
  kana: string;
  dept: string;
  position: string;
  joinDate: string;
  email: string;
  phone?: string;
  isActive?: boolean;
}

// 사원 생성/수정 요청
export interface EmployeeRequest {
  code: string;
  name: string;
  kana: string;
  dept: string;
  position: string;
  joinDate: string;
  email: string;
  phone?: string;
  isActive?: boolean;
}

// 품목 마스터
export interface Item {
  id: number;
  code: string;
  name: string;
  spec: string;
  category: string;
  unit: string;
  price: number;
  stockQty: number;
  safetyStock: number;
  warehouse: string;
  isActive?: boolean;
}

// 품목 생성/수정 요청
export interface ItemRequest {
  code: string;
  name: string;
  spec: string;
  category: string;
  unit: string;
  price: number;
  stockQty: number;
  safetyStock: number;
  warehouse: string;
  isActive?: boolean;
}

// 창고 마스터
export interface Warehouse {
  id: number;
  code: string;
  name: string;
  type: string;
  address: string;
  capacity: number;
  currentStock: number;
  manager: string;
  isActive?: boolean;
}

// 창고 생성/수정 요청
export interface WarehouseRequest {
  code: string;
  name: string;
  type: string;
  address: string;
  capacity: number;
  currentStock: number;
  manager: string;
  isActive?: boolean;
}

// 거래처 마스터
export interface Partner {
  id: number;
  code: string;
  name: string;
  type: "CUSTOMER" | "SUPPLIER" | "BOTH";
  representative: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  isActive?: boolean;
}

// 거래처 생성/수정 요청
export interface PartnerRequest {
  code: string;
  name: string;
  type: "CUSTOMER" | "SUPPLIER" | "BOTH";
  representative: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  isActive?: boolean;
}

// 마스터 검색 필터
export interface MasterSearchFilter {
  searchText?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}
