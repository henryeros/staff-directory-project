'use client';

import { usePathname } from "next/navigation";
import AppLayout from "@/layout/appLayout";
import { Providers } from "@/lib/providers";
import { ToastProvider } from "@/components/shared/toast";

const EXCLUDED_PATHS = new Set<string>([
  "/login/",
  "/login",
  "/404",
  "/not-found",
  "/",
]);

const EXCLUDED_PREFIXES = [
  "/auth",
];

function isExcluded(pathname: string) {
  // Normalize the pathname by removing trailing slashes
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  
  // 1. Exact matches with normalized path
  if (EXCLUDED_PATHS.has(normalizedPath)) return true;

  // 2. Prefix matches with normalized path
  if (EXCLUDED_PREFIXES.some((p) => 
    normalizedPath === p || normalizedPath.startsWith(p + "/")
  )) {
    return true;
  }

  // 3. 404-like routes
  if (normalizedPath.includes("404") || normalizedPath.includes("not-found")) {
    return true;
  }

  return false;
}

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  return isExcluded(pathname) ? (
    <>{children}</>
  ) : (

 <AppLayout>{children}</AppLayout>

   


  );
}
