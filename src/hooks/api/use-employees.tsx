/**
 * 사원 마스터 React Query 훅
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { employeeService } from "@/services";
import type { Employee, EmployeeRequest, MasterSearchFilter, PaginatedResponse } from "@/types";

// Query keys
export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filter?: MasterSearchFilter) => [...employeeKeys.lists(), filter] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
};

// 사원 목록 조회
export const useEmployees = (
  filter?: MasterSearchFilter,
  options?: UseQueryOptions<PaginatedResponse<Employee>>
) => {
  return useQuery({
    queryKey: employeeKeys.list(filter),
    queryFn: () => employeeService.getAll(filter),
    ...options,
  });
};

// 사원 상세 조회
export const useEmployee = (
  id: number,
  options?: UseQueryOptions<Employee>
) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// 사원 생성
export const useCreateEmployee = (
  options?: UseMutationOptions<Employee, Error, EmployeeRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeRequest) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    ...options,
  });
};

// 사원 수정
export const useUpdateEmployee = (
  options?: UseMutationOptions<Employee, Error, { id: number; data: EmployeeRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => employeeService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
    ...options,
  });
};

// 사원 삭제
export const useDeleteEmployee = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) });
    },
    ...options,
  });
};
