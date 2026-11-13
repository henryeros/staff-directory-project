import { createApi } from '@reduxjs/toolkit/query/react';
import { customFetchBase } from '@/lib/store/customFetchBase';


export const pinMailerApi = createApi({
  reducerPath: 'pinMailerApi',
  baseQuery: customFetchBase,
  endpoints: (builder) => ({
    uploadMailer: builder.mutation({
      query: (body) => ({
        url: '/PinMailer/process',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useUploadMailerMutation } = pinMailerApi;