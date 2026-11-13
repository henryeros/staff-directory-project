// src/lib/apiClient.ts
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import Cookies from "js-cookie";

/** Hardcode your API root here. change to your real domain */

export const BASE_URL = "http://10.4.1.8:4433/api/v1"; // example

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return Cookies.get("access_token") ?? null;
}

function handleUnauthorized() {
  Cookies.remove("access_token");
  if (typeof window !== "undefined") window.location.href = "/login";
}

export type HttpError = {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
  raw?: unknown;
};

function normalizeError(err: unknown): HttpError {
  const axErr = err as AxiosError<any>;
  if (axErr?.isAxiosError) {
    const status = axErr.response?.status;
    const data = axErr.response?.data;
    const message =
      data?.message ||
      data?.error ||
      axErr.message ||
      "Request failed. Please try again.";
    return {
      status,
      code: data?.code,
      message,
      details: data,
      raw: axErr.toJSON?.() ?? axErr,
    };
  }
  return { message: (err as any)?.message ?? "Unknown error", raw: err };
}

/** One axios instance. fixed baseURL. zero surprises */
const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL.replace(/\/$/, ""),
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  
  },

});

/** Attach token on every request */
instance.interceptors.request.use((config: any) => {
  const token = getAccessToken();
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }
  return config;
});

/** Unwrap data. handle 401 */
instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    if (error.response?.status === 401) handleUnauthorized();
    return Promise.reject(normalizeError(error));
  }
);

/** Typed helpers */
export type RequestOptions = Omit<AxiosRequestConfig, "url" | "method" | "data"> & {
  signal?: AbortSignal;
};

export const api = {
  get: <T = any>(url: string, params?: any, options?: RequestOptions) =>
    instance.get<T>(url, { params, signal: options?.signal, ...options }),

  post: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    instance.post<T>(url, data, { signal: options?.signal, ...options }),

  put: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    instance.put<T>(url, data, { signal: options?.signal, ...options }),

  patch: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    instance.patch<T>(url, data, { signal: options?.signal, ...options }),

  delete: <T = any>(url: string, params?: any, options?: RequestOptions) =>
    instance.delete<T>(url, { params, signal: options?.signal, ...options }),
};
