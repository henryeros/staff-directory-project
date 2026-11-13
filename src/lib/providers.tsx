'use client'
import React, { useEffect } from "react";
import {store} from "@/lib/store";
import {Provider as ReduxProvider} from "react-redux"
import { loadRuntimeConfig } from "../config";

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    useEffect(() => {
        // Ensure runtime config is loaded (from /config.json) on client
        loadRuntimeConfig().catch(() => void 0);
    }, []);

    return <ReduxProvider store={store}>
        {children}
    </ReduxProvider>
}
