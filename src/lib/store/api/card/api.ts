import {customFetchBase} from "@/lib/store/customFetchBase";
import {createApi} from "@reduxjs/toolkit/query/react";
import {buildQueryString} from "@/lib/utils/buildQueryString";

export const cardApi = createApi({
    reducerPath: 'cardApi',
    baseQuery: customFetchBase,
    tagTypes: ['Card'],
    endpoints: (builder) => ({
        uploadCard: builder.mutation({
            query:(body)=>({
                url:'/CardRequestApi/import',
                method:'POST',
                body
            }),
            invalidatesTags:['Card']
        }),
        getPublicKey: builder.query({
            query:()=>({
                url:'http://10.4.1.8:4433/api/v1/auth/public-key',
                method:'GET',
            }),
            keepUnusedDataFor: 60 * 60 * 24,// Cache this data in Redux for 24hrs
            providesTags:['Card']
        }),
        secureKey: builder.mutation({
            query:(body)=>({
                url:'/Secure/secure-endpoint',
                method:'POST',
                body
            }),
            invalidatesTags:['Card']
        }),
        sendSingleRequest: builder.mutation({
            query:(body)=>({
                url:'/CardRequestApi/cardRequest',
                method:'POST',
                body
            }),
            invalidatesTags:['Card']
        }),
        multipleBulkRequest: builder.mutation({
            query:(body)=>({
                url:'/CardRequestApi/bulk-inssert',
                method:'POST',
                body
            }),
            invalidatesTags:['Card']
        }),
        getAllCardRequests: builder.query({
            query:(params={})=>({
                url:`/CardRequestApi/GetAllCardRequests${buildQueryString(params)}`,
                method:'GET',
            }),
            providesTags:['Card']
        })
    })
})
export const {useUploadCardMutation,
    useGetPublicKeyQuery,
    useSecureKeyMutation,
    useSendSingleRequestMutation,
    useMultipleBulkRequestMutation,
    useGetAllCardRequestsQuery,
} = cardApi