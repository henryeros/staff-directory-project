// src/services/dashboard.ts
import { api, type RequestOptions } from "@/lib/apiClient";

/* ============================================================
   🔁 SHARED RESPONSE WRAPPERS
   ============================================================ */

export type ApiErrorItem = {
  field: string;
  description: string;
};

export type ApiResponseBase<TData> = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[] | null;
  data: TData;
};

/* ============================================================
   🔎 COMMON QUERY TYPES
   ============================================================ */

export type PaginatedQuery = {
  Branch?: string;
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
};

/* ============================================================
   🧩 INVENTORY TYPES
   ============================================================ */

/**
 * Single inventory row from GET /inventories
 */
export type InventoryRow = {
  id: number;
  name: string;
  category: string;        // e.g. "Laptop"
  brand: string;
  serialNumber: string;
  os: string;
  processor: string;
  ram: number;             // backend calls it "ram"
  storage: number;         // backend calls it "storage"
  condition: string;       // e.g. "New"
  assignedTo: string;
  assignedToDn: string;
  assignedDate: string;    // ISO string
  isAssigned: boolean;
};

/**
 * GET /inventories response
 */
export type GetInventoriesResponse = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[];
  data: InventoryRow[];
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  dataCount: number;
  totalCount: number;
};

/**
 * POST /inventories payload
 */
export type CreateInventoryPayload = {
  name: string;
  category: string;       // "Laptop", "Mouse", etc.
  brand: string;
  serialNumber: string;
  os: string;
  processor: string;
  ramGb: number;
  storageGb: number;
  condition: string;      // "New", "Good", etc.
  assignedTo: string;
  assignedToDn: string;
  purchaseDate: string;   // ISO date string
  assignedDate?: string;  // ISO date string (optional in your UI)
  isAssigned: boolean;
};

/**
 * POST /inventories response
 */
export type CreateInventoryResponse = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[];
  data: boolean;
};

/**
 * PUT /inventories payload
 */
export type UpdateInventoryPayload = {
  inventoryId: number;
  name: string;
  category: string;
  brand: string;
  serialNumber: string;
  os: string;
  processor: string;
  ram: number;
  storage: number;
  condition: string;
  assignedTo: string;
  assignedToDn: string;
};

/**
 * PUT /inventories response
 */
export type UpdateInventoryResponse = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[];
  data: boolean;
};

/* ============================================================
   🏢 BRANCH TYPES
   ============================================================ */

export type BranchRow = {
  name: string;
  createdDate: string;      // ISO timestamp
  address: string | null;
  dn: string;
};

export type GetBranchesResponse = ApiResponseBase<BranchRow[]>;

/* ============================================================
   📈 INVENTORY ANALYTICS (/inventories/analytics)
   ============================================================ */

/**
 * Shape of analytics in `data` for /inventories/analytics
 *
 * {
 *   "totalResources": 0,
 *   "assignedResources": 0,
 *   "unassignedResources": 0
 * }
 */
export type InventoryAnalyticsData = {
  totalResources: number;
  assignedResources: number;
  unassignedResources: number;
};

/**
 * Full response from GET /inventories/analytics
 *
 * {
 *   "isSuccess": true,
 *   "code": "string",
 *   "description": "string",
 *   "errors": [...],
 *   "data": {
 *     "totalResources": 0,
 *     "assignedResources": 0,
 *     "unassignedResources": 0
 *   }
 * }
 */
export type InventoryAnalyticsResponse = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[];
  data: InventoryAnalyticsData;
};

/* ============================================================
   📡 SERVICE FUNCTIONS
   ============================================================ */

/**
 * GET /inventories
 * Paginated fetch of inventory list.
 */
export const getInventories = (
  query: PaginatedQuery,
  options?: RequestOptions
) => {
  // IMPORTANT: pass `query` so PageNumber/PageSize/Search actually work
  return api.get<GetInventoriesResponse>("/inventories");
};

/**
 * POST /inventories
 * Create a new inventory record.
 */
export const createInventory = (
  payload: CreateInventoryPayload,
  options?: RequestOptions
) => {
  return api.post<CreateInventoryResponse>("/inventories", payload, options);
};

/**
 * PUT /inventories
 * Update an existing inventory record.
 */
export const updateInventory = (
  payload: UpdateInventoryPayload,
  options?: RequestOptions
) => {
  return api.put<UpdateInventoryResponse>("/inventories", payload, options);
};

/**
 * GET /inventories/analytics
 * Fetch high-level counts for dashboards.
 */
export const getInventoriesActivities = (
  query: PaginatedQuery,
  options?: RequestOptions
) => {
  // analytics doesn't actually use pagination in the structure you gave,
  // but we'll keep `query` + `options` for consistency/extensibility.
  return api.get<InventoryAnalyticsResponse>("/inventories/analytics", query, options);
};


export const getInventoryById = (
  id: number,
  options?: RequestOptions
) => {
  return api.get<GetInventoryByIdResponse>(`/inventories/${id}`, undefined, options);
};

/**
 * Response type for GET /inventories/{id}
 */
export type GetInventoryByIdResponse = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[];
  data: InventoryRow;
};