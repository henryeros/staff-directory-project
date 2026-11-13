import {configureStore} from "@reduxjs/toolkit";
import {setupListeners} from "@reduxjs/toolkit/query";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import sidebarReducer from "./slice/sideSlice";
import { pinMailerApi } from "./api/pinMailer/api";
import {cardApi} from "@/lib/store/api/card/api";
import requestSlice from "@/lib/store/slice/requestSlice";
import {userMgtApi} from "@/lib/store/api/userMgt/api";
import authReducer from "./slice/auth/authSlice";

export const store = configureStore({
    reducer:{
        sidebar: sidebarReducer,
        request: requestSlice,
        auth: authReducer,
        [pinMailerApi.reducerPath]: pinMailerApi.reducer,
        [cardApi.reducerPath]: cardApi.reducer,
        [userMgtApi.reducerPath]: userMgtApi.reducer,

    },
    middleware:(getDefaultMiddleware) =>
        getDefaultMiddleware().concat([
            pinMailerApi.middleware,
            cardApi.middleware,
            userMgtApi.middleware,
        ])
})
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch =()=>useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector