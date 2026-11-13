// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL }

  // If deploying under a virtual directory like /myapp, uncomment these:
  // basePath: "/myapp",
  // assetPrefix: "/myapp/",
};

export default nextConfig;
