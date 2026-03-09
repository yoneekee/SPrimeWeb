/**
 * 마스터 데이터 서비스
 * 사원, 품목, 창고, 거래처 마스터 API 호출 로직
 */

import { apiClient } from "./api-client";
import type {
  Employee,
  EmployeeRequest,
  Item,
  ItemRequest,
  Warehouse,
  WarehouseRequest,
  Partner,
  PartnerRequest,
  MasterSearchFilter,
  PaginatedResponse,
} from "@/types";

// 사원 마스터 서비스
export const employeeService = {
  async getAll(filter?: MasterSearchFilter): Promise<PaginatedResponse<Employee>> {
    return apiClient.get<PaginatedResponse<Employee>>("/employees", { 
      params: filter as any 
    });
  },

  async getById(id: number): Promise<Employee> {
    return apiClient.get<Employee>(`/employees/${id}`);
  },

  async create(data: EmployeeRequest): Promise<Employee> {
    return apiClient.post<Employee>("/employees", data);
  },

  async update(id: number, data: EmployeeRequest): Promise<Employee> {
    return apiClient.put<Employee>(`/employees/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/employees/${id}`);
  },
};

// 품목 마스터 서비스
export const itemService = {
  async getAll(filter?: MasterSearchFilter): Promise<PaginatedResponse<Item>> {
    return apiClient.get<PaginatedResponse<Item>>("/items", { 
      params: filter as any 
    });
  },

  async getById(id: number): Promise<Item> {
    return apiClient.get<Item>(`/items/${id}`);
  },

  async getByCode(code: string): Promise<Item> {
    return apiClient.get<Item>(`/items/code/${code}`);
  },

  async create(data: ItemRequest): Promise<Item> {
    return apiClient.post<Item>("/items", data);
  },

  async update(id: number, data: ItemRequest): Promise<Item> {
    return apiClient.put<Item>(`/items/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/items/${id}`);
  },

  // 재고 조회
  async getStock(itemCode: string): Promise<{ itemCode: string; quantity: number; warehouse: string }[]> {
    return apiClient.get<{ itemCode: string; quantity: number; warehouse: string }[]>(
      `/items/${itemCode}/stock`
    );
  },
};

// 창고 마스터 서비스
export const warehouseService = {
  async getAll(filter?: MasterSearchFilter): Promise<PaginatedResponse<Warehouse>> {
    return apiClient.get<PaginatedResponse<Warehouse>>("/warehouses", { 
      params: filter as any 
    });
  },

  async getById(id: number): Promise<Warehouse> {
    return apiClient.get<Warehouse>(`/warehouses/${id}`);
  },

  async create(data: WarehouseRequest): Promise<Warehouse> {
    return apiClient.post<Warehouse>("/warehouses", data);
  },

  async update(id: number, data: WarehouseRequest): Promise<Warehouse> {
    return apiClient.put<Warehouse>(`/warehouses/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/warehouses/${id}`);
  },
};

// 거래처 마스터 서비스
export const partnerService = {
  async getAll(filter?: MasterSearchFilter): Promise<PaginatedResponse<Partner>> {
    return apiClient.get<PaginatedResponse<Partner>>("/partners", { 
      params: filter as any 
    });
  },

  async getById(id: number): Promise<Partner> {
    return apiClient.get<Partner>(`/partners/${id}`);
  },

  async create(data: PartnerRequest): Promise<Partner> {
    return apiClient.post<Partner>("/partners", data);
  },

  async update(id: number, data: PartnerRequest): Promise<Partner> {
    return apiClient.put<Partner>(`/partners/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/partners/${id}`);
  },

  // 타입별 거래처 조회
  async getByType(type: "CUSTOMER" | "SUPPLIER" | "BOTH"): Promise<Partner[]> {
    return apiClient.get<Partner[]>("/partners", { 
      params: { type } 
    });
  },
};
