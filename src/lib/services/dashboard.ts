// src/services/dashboard.ts
import { api, type RequestOptions } from "@/lib/apiClient";
import { createEncryptedPayload, decryptResponse } from "@/lib/utils/cryptoUtils";

/** ===== Types (adjust to your backend contracts) ===== */

/** Query params for hires / users listing */
export type HireQuery = {
  Branch?: string;
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
};

/** Paginated query for departments */
export type PaginatedQuery = {
  Branch?: string;
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
};

/** ========= Shared Response Wrapper ========= **/
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

/** ========= Hires/Users Types ========= **/

/** Row returned in getHires() (new hires table / dashboard widget) */
export type HireRow = {
  DisplayNameString: string;
  JobTitleString: string;
  DepartmentString: string;
  StartDate: string;
  IsActiveString: "true" | "false";
  EmailString?: string;
  PhoneNumberString?: string;
  DateOfBirth?: string;
  EmploymentTypeString?: string;
  GenderString?: string;
};

/** Response for getHires() */
export type HireApiResult = {
  data: HireRow[];
  total?: number;
  pageNumber?: number;
  pageSize?: number;
};

/** Dashboard analytics totals */
export type AnalyticsApiResult = {
  data: {
    totalEmployees: number;
    totalDepartments: number;
    totalNewHires: number;
  };
};

/** ===== Create New Hire (Create User) ===== */
export type CreateHirePayload = {
  firstname: string;
  surname: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;   // ISO timestamp
  gender: string;
  jobTitle: string;
  startDate: string;     // ISO timestamp
  branch: string;
  department: string;
  departmentId: number;
  employmentType: string;
};

export type CreateHireResponse = ApiResponseBase<string>;

/** ===== Users List (getUsers) ===== */
export type UserRow = {
  username: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  jobTitle: string;
  startDate: string;
  accountCreationDate: string;
  department: string;
  employmentType: string;
  dn: string;
  isActive: boolean;
  token: string;
  tokenExpiry: string;
  userType: "Administrator" | string;
};

export type GetUsersResponse = ApiResponseBase<UserRow[]>;

/** ===== Edit User (update existing employee) ===== */
export type EditUserPayload = {
  firstname: string;
  surname: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  jobTitle: string;
  startDate: string;
  branch: string;
  department: string;
  departmentId: number;
  employmentType: string;
  dn: string;
};

export type EditUserResponse = ApiResponseBase<string>;

/** ===== Activate/Deactivate User ===== */
export type ActivateDeactivatePayload = {
  Dn: string;
  Status: boolean;
};

export type ActivateDeactivateResponse = ApiResponseBase<string>;

/** ========= Departments ========= **/
export type DepartmentRow = {
  id: number;
  name: string;
  headOfDepartment: string;
  numberOfEmployees: number;
  dn: string;
};

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

export type CreateDepartmentPayload = {
  name: string;
  headOfDepartment: string;
  branchDn: string;
};

export type UpdateDepartmentPayload = {
  id: number;
  name: string;
  headOfDepartment: string;
  branchDn: string;
};

export type MutateDepartmentResponse = ApiResponseBase<string>;

/** ========= Branches ========= **/
export type BranchRow = {
  name: string;
  createdDate: string;
  address: string;
  dn: string;
};

export type GetBranchesResponse = ApiResponseBase<BranchRow[]>;

/** ========= Inventory Types ========= **/

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

/**
 * Shape of analytics in `data` for /inventories/analytics
 */
export type InventoryAnalyticsData = {
  totalResources: number;
  assignedResources: number;
  unassignedResources: number;
};

/**
 * Full response from GET /inventories/analytics
 */
export type InventoryAnalyticsResponse = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[];
  data: InventoryAnalyticsData;
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

/** ===== Encrypted Packet Type ===== */
export type EncryptedPacket = {
  EncryptedKey: string;
  EncryptedData: string;
  IV: string;
};

/** ===== Services with Encryption ===== */

/**
 * Get hires with encrypted query params
 */
export const getHires = async (
  query: HireQuery,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<HireApiResult> => {
  const encryptedPayload = await createEncryptedPayload(
    query,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.get<EncryptedPacket>(
    "/users/hires",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    data?: any;
    Data?: any;
  };

  const responseData = parsed.data ?? parsed.Data;

  console.log(responseData, 'hired');

  return {
    data: Array.isArray(responseData) ? responseData : [],
    total: responseData?.total,
    pageNumber: responseData?.pageNumber,
    pageSize: responseData?.pageSize,
  };
};

/**
 * Get dashboard analytics (encrypted)
 */
export const getAnalytics = async (
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<AnalyticsApiResult> => {
  const encryptedPayload = await createEncryptedPayload(
    {},
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.get<EncryptedPacket>(
    "/users/analytics",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    data?: any;
    Data?: any;
  };

  const responseData = parsed.data ?? parsed.Data;

  return {
    data: {
      totalEmployees: responseData?.totalEmployees ?? 0,
      totalDepartments: responseData?.totalDepartments ?? 0,
      totalNewHires: responseData?.totalNewHires ?? 0,
    }
  };
};

/**
 * Create new hire (encrypted)
 */
export const createHire = async (
  payload: CreateHirePayload,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<CreateHireResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    payload,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.post<EncryptedPacket>(
    "/users",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: string;
    Data?: string;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? "",
  };
};

/**
 * Fetch full user list (encrypted)
 */
export const getUsers = async (
  query: HireQuery,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<GetUsersResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    {},
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.get<EncryptedPacket>(
    "/users",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  return decrypted as GetUsersResponse;
};

/**
 * Edit/update existing user (encrypted)
 */
export const editUser = async (
  payload: EditUserPayload,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<EditUserResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    payload,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.put<EncryptedPacket>(
    "/users",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  return decrypted as EditUserResponse;
};

/**
 * Activate or deactivate a user (encrypted)
 */
export const activateDeactivateUser = async (
  dn: string,
  status: boolean,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<ActivateDeactivateResponse> => {
  const payload: ActivateDeactivatePayload = { Dn: dn, Status: status };

  const encryptedPayload = await createEncryptedPayload(
    payload,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.put<EncryptedPacket>(
    "/activate-disable",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  return decrypted as ActivateDeactivateResponse;
};

/**
 * Get departments with encryption
 */
export const getDepartments = async (
  query: PaginatedQuery,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<GetDepartmentsResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    query,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.get<EncryptedPacket>(
    "/departments",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: DepartmentRow[];
    Data?: DepartmentRow[];
    pageNumber?: number;
    PageNumber?: number;
    pageSize?: number;
    PageSize?: number;
    pageCount?: number;
    PageCount?: number;
    dataCount?: number;
    DataCount?: number;
    totalCount?: number;
    TotalCount?: number;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? [],
    pageNumber: parsed.pageNumber ?? parsed.PageNumber ?? 0,
    pageSize: parsed.pageSize ?? parsed.PageSize ?? 0,
    pageCount: parsed.pageCount ?? parsed.PageCount ?? 0,
    dataCount: parsed.dataCount ?? parsed.DataCount ?? 0,
    totalCount: parsed.totalCount ?? parsed.TotalCount ?? 0,
  };
};

/**
 * Get branches with encryption
 */
export const getBranches = async (
  query: Record<string, any>,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<GetBranchesResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    query ?? {},
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.get<EncryptedPacket>(
    "/branches",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: BranchRow[];
    Data?: BranchRow[];
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? [],
  };
};

/**
 * Create new department with encryption
 */
export const createDepartment = async (
  payload: CreateDepartmentPayload,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<MutateDepartmentResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    payload,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.post<EncryptedPacket>(
    "/departments",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: string;
    Data?: string;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? "",
  };
};

/**
 * Update existing department with encryption
 */
export const updateDepartment = async (
  payload: UpdateDepartmentPayload,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<MutateDepartmentResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    payload,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.put<EncryptedPacket>(
    "/departments",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: string;
    Data?: string;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? "",
  };
};

/** ========= Inventory Services with Encryption ========= **/

/**
 * Get inventories with encryption
 */
export const getInventories = async (
  query: PaginatedQuery,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<GetInventoriesResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    query,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.get<EncryptedPacket>(
    "/inventories",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: InventoryRow[];
    Data?: InventoryRow[];
    pageNumber?: number;
    PageNumber?: number;
    pageSize?: number;
    PageSize?: number;
    pageCount?: number;
    PageCount?: number;
    dataCount?: number;
    DataCount?: number;
    totalCount?: number;
    TotalCount?: number;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? [],
    pageNumber: parsed.pageNumber ?? parsed.PageNumber ?? 0,
    pageSize: parsed.pageSize ?? parsed.PageSize ?? 0,
    pageCount: parsed.pageCount ?? parsed.PageCount ?? 0,
    dataCount: parsed.dataCount ?? parsed.DataCount ?? 0,
    totalCount: parsed.totalCount ?? parsed.TotalCount ?? 0,
  };
};

/**
 * Create new inventory with encryption
 */
export const createInventory = async (
  payload: CreateInventoryPayload,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<CreateInventoryResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    payload,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.post<EncryptedPacket>(
    "/inventories",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: boolean;
    Data?: boolean;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? false,
  };
};

/**
 * Update existing inventory with encryption
 */
export const updateInventory = async (
  payload: UpdateInventoryPayload,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<UpdateInventoryResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    payload,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.put<EncryptedPacket>(
    "/inventories",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: boolean;
    Data?: boolean;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? false,
  };
};

/**
 * Get inventory analytics with encryption
 */
export const getInventoriesActivities = async (
  query: PaginatedQuery,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<InventoryAnalyticsResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    query,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.get<EncryptedPacket>(
    "/inventories/analytics",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: InventoryAnalyticsData;
    Data?: InventoryAnalyticsData;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? {
      totalResources: 0,
      assignedResources: 0,
      unassignedResources: 0,
    },
  };
};

/**
 * Get inventory by ID with encryption
 */
export const getInventoryById = async (
  id: number,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<GetInventoryByIdResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    { id },
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.get<EncryptedPacket>(
    `/inventories/${id}`,
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: InventoryRow;
    Data?: InventoryRow;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? {} as InventoryRow,
  };
};

/**
 * Convenience helper: fetch both hires + analytics in parallel (encrypted)
 */
export const getDashboardData = async (
  query: HireQuery,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
) => {
  const [hires, analytics] = await Promise.all([
    getHires(query, backendPublicKey, keyPair, options),
    getAnalytics(backendPublicKey, keyPair, options),
  ]);
  return { hires, analytics };
};


// Add to your existing types in src/services/dashboard.ts

/** ===== Get Single Employee Types ===== */
export type GetSingleEmployeePayload = {
  dn: string;
};

export type SingleEmployeeRow = {
  username: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  jobTitle: string;
  startDate: string;
  accountCreationDate: string;
  department: string;
  employmentType: string;
  dn: string;
  isActive: boolean;
  token: string;
  tokenExpiry: string;
  userType: "Administrator" | string;
  branch?: string;
  address?: string;
  emergencyContact?: string;
};

export type GetSingleEmployeeResponse = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[];
  data: SingleEmployeeRow;
};

/** ===== Services with Encryption ===== */

/**
 * Get single employee by DN with encryption
 * This is a POST endpoint that requires dn in the payload
 */
export const getSingleEmployee = async (
  payload: GetSingleEmployeePayload,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<GetSingleEmployeeResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    payload,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.post<EncryptedPacket>(
    "/users/get-user", // Adjust the endpoint if different
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: SingleEmployeeRow;
    Data?: SingleEmployeeRow;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? {} as SingleEmployeeRow,
  };
};

// src/services/dashboard.ts - Add this function to the existing file

/**
 * Update existing user (encrypted)
 */
export const updateUser = async (
  payload: EditUserPayload,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<EditUserResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    payload,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.put<EncryptedPacket>(
    "/users",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: string;
    Data?: string;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? "",
  };
};



// Add to your existing types in src/services/dashboard.ts

/** ===== QR Code Generation Types ===== */
export type GenerateQRPayload = {
  url: string;
};

export type GenerateQRResponseData = {
  qrCodeBase64: string;
};

export type GenerateQRResponse = {
  isSuccess: boolean;
  code: string;
  description: string;
  errors: ApiErrorItem[];
  data: GenerateQRResponseData;
};

/** ===== Services with Encryption ===== */

/**
 * Generate QR code with encryption
 */
export const generateQR = async (
  payload: GenerateQRPayload,
  backendPublicKey: CryptoKey,
  keyPair: CryptoKeyPair,
  options?: RequestOptions
): Promise<GenerateQRResponse> => {
  const encryptedPayload = await createEncryptedPayload(
    payload,
    backendPublicKey,
    keyPair
  );

  const rawResponse = await api.post<EncryptedPacket>(
    "/qr/generate",
    encryptedPayload,
    options
  );

  const packet = (rawResponse as any)?.data ?? rawResponse;

  const decrypted = await decryptResponse(
    {
      EncryptedKey: packet.EncryptedKey,
      EncryptedData: packet.EncryptedData,
      IV: packet.IV,
    },
    keyPair.privateKey
  );

  const parsed = decrypted as {
    isSuccess?: boolean;
    IsSuccess?: boolean;
    code?: string;
    Code?: string;
    description?: string;
    Description?: string;
    errors?: ApiErrorItem[];
    Errors?: ApiErrorItem[];
    data?: GenerateQRResponseData;
    Data?: GenerateQRResponseData;
  };

  return {
    isSuccess: parsed.isSuccess ?? parsed.IsSuccess ?? false,
    code: parsed.code ?? parsed.Code ?? "",
    description: parsed.description ?? parsed.Description ?? "",
    errors: parsed.errors ?? parsed.Errors ?? [],
    data: parsed.data ?? parsed.Data ?? { qrCodeBase64: "" },
  };
};