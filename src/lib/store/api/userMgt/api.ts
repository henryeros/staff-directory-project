import {createApi} from "@reduxjs/toolkit/query/react";
import {customFetchBase} from "@/lib/store/customFetchBase";

export const userMgtApi = createApi({
    reducerPath: 'userMgtApi',
    baseQuery: customFetchBase,
    tagTypes: ['UserMgt'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query:(body)=>({
                url:'/auth/login',
                method:'POST',
                body
            }),
            invalidatesTags:['UserMgt']
        }),

    })
})
export const {useLoginMutation} = userMgtApi