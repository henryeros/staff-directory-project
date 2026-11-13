
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ClientLayoutWrapper from "./layout.client";
import { Providers } from "@/lib/providers";
import Script from "next/script";

import { ToastProvider } from "@/components/shared/toast";


export const metadata: Metadata = {
  title: "Tatum Bank Dashboard",
  description: "Secure banking platform for teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
        <head>
        <Script src="/config.js" strategy="beforeInteractive" />
      </head>
      <body className={`antialiased`}>
        <Providers>
          <ToastProvider>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
</ToastProvider>
        </Providers>

      </body>
    </html>
  );
}
