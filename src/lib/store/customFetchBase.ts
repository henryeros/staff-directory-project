
import {fetchBaseQuery } from '@reduxjs/toolkit/query';
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import {getConfig, loadRuntimeConfig} from "@/config";

// A baseQuery that reads the runtime config at call time so we don't bind
// to an undefined baseUrl before runtime config has been loaded.
export const dynamicBaseQuery: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    await loadRuntimeConfig();
    const cfg = getConfig();
    const baseUrl: string = (cfg?.API_BASE_URL ?? '').replace(/\/$/, '');


    const rawBaseQuery = fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                if (token) {
                    headers.set('authorization', `Bearer ${token}`);
                }
            } catch {}
            headers.set('Accept', 'application/json');
            // Let fetchBaseQuery set Content-Type automatically for object bodies
            return headers;
        },
    });

    return rawBaseQuery(args, api, extraOptions);
};


// Backwards-compatible alias so existing imports keep working
export const customFetchBase = dynamicBaseQuery;



