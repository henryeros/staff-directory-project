// src/services/dashboard.ts
import { api, type RequestOptions } from "@/lib/apiClient";

/** ========= Shared Response Wrapper ========= **/

// Many of your endpoints return this wrapper:
// { isSuccess, code, description, errors, data, ...maybe paging... }
export type ApiErrorItem = {
  field: string;
  description: string;
};

export type ApiResponseBase<TData> = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[];
  data: TData;
};

/** ========= Query Types ========= **/

export type PaginatedQuery = {
  Branch?: string;
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
};

/** ========= Departments ========= **/

// Single department row from GET /departments
export type DepartmentRow = {
  id: number;
  name: string;
  headOfDepartment: string;
  numberOfEmployees: number;
  dn: string;
};

// Full GET /departments response shape
export type GetDepartmentsResponse = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[];
  data: DepartmentRow[];
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  dataCount: number;
  totalCount: number;
};

// Payload when creating a department
export type CreateDepartmentPayload = {
  name: string;
  headOfDepartment: string;
  branchDn: string;
};

// Payload when updating a department
export type UpdateDepartmentPayload = {
  id: number;
  name: string;
  headOfDepartment: string;
  branchDn: string;
};

// The API’s create/update response looks like:
// {
//   "isSuccess": true,
//   "code": "string",
//   "description": "string",
//   "errors": [...],
//   "data": "string"
// }
export type MutateDepartmentResponse = ApiResponseBase<string>;

/** ========= Branches ========= **/

// Single branch row from GET /branches
export type BranchRow = {
  name: string;
  createdDate: string; // ISO string "2025-10-26T21:33:53.657Z"
  address: string;
  dn: string;
};

// Full GET /branches response shape
export type GetBranchesResponse = ApiResponseBase<BranchRow[]>;

/** ========= Services ========= **/

/** Get departments (paginated, filterable) */
export const getDepartments = (
  query: PaginatedQuery,
  options?: RequestOptions
) => api.get<GetDepartmentsResponse>("/departments", query, options);

/** Get branches (list, no paging fields mentioned) */
export const getBranches = (
  query?: Record<string, any>, // if backend supports filters, pass them. If not, you can just call with {}
  options?: RequestOptions
) => api.get<GetBranchesResponse>("/branches", query, options);

/** Create new department */
export const createDepartment = (
  payload: CreateDepartmentPayload,
  options?: RequestOptions
) => api.post<MutateDepartmentResponse>("/departments", payload, options);

/** Update existing department */
export const updateDepartment = (
  payload: UpdateDepartmentPayload,
  options?: RequestOptions
) => api.put<MutateDepartmentResponse>(`/departments`, payload, options);


